module.exports = function (db, helpers) {
  const addBlock = blockData => {
    return db.insert('blocks', blockData)
             .then(rows => rows[0])
  }

  const updateBlock = (blockData, id, userId) => {
    return db.update('blocks', id, blockData)
  }

  const deleteBlock = (userId, blockId) => {
    return db.query(`
    DELETE FROM blocks
    WHERE user_id = $1 AND id = $2
    RETURNING *
    `, [userId, blockId])
  }

  // Defaults to the current week, but can accept any target date.
  const getWeeklyBlocksByUser = (userId, targetDate = new Date()) => {
    // Get Sunday and Saturday for given week.
    const { lastSunday, nextSaturday } = helpers.getWeekBounds(targetDate);
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

  return {
    addBlock,
    updateBlock,
    deleteBlock,
    getWeeklyBlocksByUser
  }
}