const bcrypt = require('bcrypt');

module.exports = function (db, helpers) {

  const userHelpers = require('./userHelpers')(db, helpers)
  const blockHelpers = require('./blockHelpers')(db, helpers)
  const projectHelpers = require('./projectHelpers')(db, helpers)
  const sessionHelpers = require('./sessionHelpers')(db, helpers)

  // getWeeklyReport finds every project that:
  // 1. Belongs to this user
  // 2. Has blocks scheduled this week
  //    (note that we don't care if any sessions are logged for this project or not)
  // Then sum up the time deltas for the sessions and blocks to get the total time blocked and total time tracked
  // If no time was tracked, "sessions_total" will be null.
  // NOTE: "EXTRACT EPOCH" is used to turn the time interval into a number of seconds.
  // That way we can calculate hours on the frontend.
  const getWeeklyReport = (userId, targetDate = new Date()) => {
    const { lastSunday, nextSaturday } = helpers.getWeekBounds(targetDate);

    return db.query(`
      SELECT
        projects.id AS project_id,
        sessionsum.total AS sessions_total,
        blocksum.total AS blocks_total
      FROM projects
        LEFT JOIN (
          SELECT projects.id AS id,
          SUM(EXTRACT(EPOCH FROM (sessions.end_time-sessions.start_time))) AS total
          FROM projects
            LEFT JOIN sessions ON projects.id = sessions.project_id
          WHERE sessions.start_time BETWEEN $2 AND $3 OR sessions.id IS NULL
          GROUP BY projects.id
        ) sessionsum ON sessionsum.id = projects.id
        JOIN (
          SELECT projects.id AS id,
          SUM(EXTRACT(EPOCH FROM (blocks.end_time-blocks.start_time))) AS total
          FROM projects
            JOIN blocks ON projects.id = blocks.project_id
          WHERE blocks.start_time BETWEEN $2 AND $3
          GROUP BY projects.id
        ) blocksum ON blocksum.id = projects.id
      WHERE projects.user_id = $1
      `, [userId, lastSunday.toISOString(), nextSaturday.toISOString()]);
  }



  return {
    ...userHelpers,
    ...blockHelpers,
    ...projectHelpers,
    ...sessionHelpers,
    getWeeklyReport
  }
}