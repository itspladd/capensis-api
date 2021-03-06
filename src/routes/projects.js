const express = require('express');

module.exports = function (db) {
  const router = express.Router();

  router.get('/', (req, res) => {
    // Get all projects for currently-logged-in user.
    const userId = req.session.userId;
    db.getProjectsByUser(userId)
      .then(projects => res.json(projects))
  })

  router.post('/', (req, res) => {
    // Create a new project for the currently-logged-in user.
    const userId = req.session.userId;
    const { project } = req.body
    db.addProject(userId, project.title)
      .then(project => res.json(project))
  })

  router.patch('/:id', (req, res) => {
    const userId = req.session.userId;
    const projectId = req.params.id;
    const { project } = req.body;
    db.updateProjectTitle(userId, projectId, project.title)
      .then(rows => res.json(rows[0]))
  })

  return router;
}