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
    return db.update('projects', projectId, { title }, {user_id: userId})
  }

  return {
    addProject,
    updateProjectTitle,
    getProjectsByUser,
  }
}