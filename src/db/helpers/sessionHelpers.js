module.exports = function (db, helpers) {
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

  const deleteSession = (userId, sessionId) => {
    return db.query(`
    DELETE FROM sessions
    WHERE user_id = $1 AND id = $2
    RETURNING *
    `, [userId, sessionId])
  }

  // Updates a session with new start/end times.
  const updateSession = sessionData => {
    const { session_id, start_time, end_time } = sessionData
    return db.update('sessions', session_id, {start_time, end_time});
  }

  const getWeeklySessions = (userId, targetDate = new Date()) => {
    const { lastSunday, nextSaturday } = helpers.getWeekBounds(targetDate);
    return db.query(`
      SELECT sessions.*, projects.title
      FROM sessions
      JOIN projects
        ON projects.id = sessions.project_id
      WHERE sessions.user_id=$1
      AND sessions.start_time >= $2
      AND sessions.start_time <= $3
      ORDER BY sessions.project_id DESC, sessions.start_time DESC
      `, [userId, lastSunday.toISOString(), nextSaturday.toISOString()]);
  }

  // Get the most recent unfinished session for this user.
  const getCurrentSession = (userId) => {
    return db.query(`
      SELECT * FROM sessions
      WHERE user_id=$1
      AND end_time IS NULL
      ORDER BY start_time DESC
      LIMIT 1
      `, [userId]);
  }

  return {
    startSession,
    stopSession,
    updateSession,
    deleteSession,
    getCurrentSession,
    getWeeklySessions
  }
}