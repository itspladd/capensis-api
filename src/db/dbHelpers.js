const bcrypt = require('bcrypt');

const { getWeekBounds } = require('../helpers')

module.exports = function (db) {

  const getUsernameById = id => {
    return db.query(`SELECT username FROM users WHERE id = $1`, [id])
             .then(rows => {
               if (rows[0]) {
                 return rows[0].username
               } else {
                 return null;
               }
             })
  }

  const getIdByUsername = username => {
    return db.query(`SELECT id FROM users WHERE username = $1`, [username])
             .then(rows => {
               if (rows[0]) {
                 return rows[0].id;
               } else {
                 return null;
               }
             })
  }

  // The user parameter must have two keys: "username" and "hashed_password"
  const addUser = (username, rawPassword) => {
    const saltRounds = 10;
    return bcrypt.hash(rawPassword, saltRounds)
                 .then(hashed_password => db.insert(`users`, {username, hashed_password}))
                 .then(rows => rows[0])
  }

  const validLogin = (username, rawPassword) => {
    // Find the hashed password matching the username
    return db.query(`SELECT hashed_password FROM users WHERE username = $1`, [username])
             .then(rows => {
               // If there's a matching user, check the password and return result
               if (rows[0]) {
                const { hashed_password } = rows[0];
                return bcrypt.compare(rawPassword, hashed_password);
               } else {
                // If there's no result, return false
                return false;
               }
             });
  }

  // Defaults to the current week, but can accept any target date.
  const getWeeklyBlocksByUser = (userId, targetDate = new Date()) => {
    // Get Sunday and Saturday for given week.
    const { lastSunday, nextSaturday } = getWeekBounds(targetDate);
    console.log(`looking up blocks for user id ${userId} between ${lastSunday.toISOString()} and ${nextSaturday.toISOString()}`);

    return db.query(`
      SELECT blocks.*, projects.title FROM blocks
        JOIN projects
        ON blocks.project_id = projects.id
      WHERE blocks.user_id = $1
      AND start_time BETWEEN $2 AND $3
      ORDER BY start_time
      `, [userId, lastSunday.toISOString(), nextSaturday.toISOString()])
  }

  const getProjectsByUser = userId => {
    return db.query(`
      SELECT * FROM projects
      WHERE user_id = $1
      `, [userId])
  }

  const addProject = (userId, title) => {
    const project = { user_id: userId, title };
    return db.insert('projects', project)
             .then(rows => rows[0]);
  }

  const updateProjectTitle = (userId, projectId, title) => {
    return db.query(`
      UPDATE projects SET title = $1
      WHERE id = $2
      AND user_id = $3
      RETURNING *
    `, [title, projectId, userId]);
  }

  // Creates a single new session in the DB and then returns the data about that session.
  const startSession = sessionData => {
    return db.insert('sessions', sessionData)
             .then(rows => rows[0])
  }

  // "Stops" a session and returns the stopped session.
  const stopSession = (userId, sessionId) => {
    const nowStr = (new Date()).toISOString();
    console.log(`Stopping session at: ${nowStr}`)
    return db.query(`
      UPDATE sessions SET end_time = $1
      WHERE id = $2
      AND user_id = $3
      RETURNING *
    `, [nowStr, sessionId, userId]);
  }

  const getWeeklySessions = (userId, targetDate = new Date()) => {
    const { lastSunday } = getWeekBounds(targetDate);
    return db.query(`
      SELECT * FROM sessions
      WHERE user_id=$1
      AND start_time > $2
      `, [userId, lastSunday.toISOString()]);
  }

  // getWeeklyReport finds every project that:
  // 1. Belongs to this user
  // 2. Has blocks scheduled this week
  //    (note that we don't care if any sessions are logged for this project or not)
  // Then sum up the time deltas for the sessions and blocks to get the total time blocked and total time tracked
  // If no time was tracked, "sessions_total" will be null.
  // NOTE: "EXTRACT EPOCH" is used to turn the time interval into a number of seconds.
  // That way we can calculate hours on the frontend.
  const getWeeklyReport = (userId, targetDate = new Date()) => {
    const { lastSunday, nextSaturday } = getWeekBounds(targetDate);

    return db.query(`
      SELECT
        projects.id AS project_id,
        SUM(EXTRACT(EPOCH FROM (sessions.end_time-sessions.start_time))) AS sessions_total,
        SUM(EXTRACT(EPOCH FROM (blocks.end_time-blocks.start_time))) AS blocks_total
      FROM projects
        LEFT JOIN sessions ON projects.id = sessions.project_id
        JOIN blocks ON projects.id = blocks.project_id
      WHERE projects.user_id = $1
        AND (sessions.id IS NULL OR (sessions.start_time BETWEEN $2 AND $3))
        AND (blocks.start_time BETWEEN $2 AND $3)
      GROUP BY projects.id
      `, [userId, lastSunday.toISOString(), nextSaturday.toISOString()]);
  }

  const addBlock = blockData => {
    return db.insert('blocks', blockData)
             .then(rows => rows[0])
  }

  return {
    getUsernameById,
    addUser,
    validLogin,
    getIdByUsername,
    getWeeklyBlocksByUser,
    getProjectsByUser,
    addProject,
    updateProjectTitle,
    startSession,
    stopSession,
    getWeeklySessions,
    getWeeklyReport,
    addBlock
  }
}