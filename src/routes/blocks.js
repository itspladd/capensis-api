const express = require('express');

module.exports = function (db) {
  const router = express.Router();

  router.post('/', (req, res) => {
    const userId = req.session.userId
    const { startTime, endTime, project } = req.body;
    const blockData = { 
      start_time: startTime,
      end_time: endTime,
      project_id: Number(project),
      user_id: userId
    }
    return db.addBlock(blockData)
            .then(block => res.json(block))
    // Create a new block for the currently-logged-in user.
    // Get the project ID from the request.
  })

  router.patch('/:id', (req, res) => {
    const { startTime, endTime, project } = req.body;
    const { id } = req.params
    const newData = {
      start_time: startTime,
      end_time: endTime,
      project_id: Number(project)
    }
    return db.updateBlock(newData, id, req.currentUser)
      .then(data => res.json(data))
  })

  router.delete('/:id', (req, res) => {
    const { id } = req.params
    return db.deleteBlock(req.currentUser, id)
      .then((data) => res.json(data));
  })

  // Get this week's blocks for current user.
  router.get('/week', (req, res) => {
    // If a date is supplied, use that date as the target.
    // Otherwise, we use today's date.
    const targetDate = req.query.date ? new Date(req.query.date) : new Date();

    const userId = req.session.userId;
    db.getWeeklyBlocksByUser(userId, targetDate)
      .then(data => res.json(data));
  });

  return router;
}