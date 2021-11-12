module.exports = function (db) {
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

  return {
    addProject,
    updateProjectTitle,
    getProjectsByUser,
  }
}