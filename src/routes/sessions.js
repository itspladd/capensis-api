const express = require('express');

module.exports = function (db) {
  const router = express.Router();

  router.post('/', (req, res) => {
    // Start a new session for the current user.
    // Get the project ID from the request.
    const { project_id } = req.body;
    db.startSession({ user_id: req.currentUser, project_id })
      .then(rows => res.json(rows))
  })

  router.patch('/', (req, res) => {
    // Stop a currently-running session.
    const { id } = req.body;
    db.stopSession(req.currentUser, id)
      .then(rows => res.json(rows[0]))
  })

  // Return all sessions for a given week
  router.get('/week', (req, res) => {
    // If a date is supplied, use that date as the target.
    // Otherwise, we use today's date.
    const targetDate = req.query.date ? new Date(req.query.date) : new Date();
    return db.getWeeklySessions(req.currentUser, targetDate)
             .then(data => res.json(data))
  })

  // Get the most recent session that is still running for this user, if any.
  router.get('/current', (req, res) => {
    return db.getCurrentSession(req.currentUser)
             .then(rows => res.json(rows))
  })

  router.patch('/:sessionId', (req, res) =>{
    // Change the start or stop time of a session.
    const session_id = req.params.sessionId;
    const { start_time, end_time } = req.body;
    return db.updateSession({ user_id: req.currentUser, session_id, start_time, end_time })
             .then(rows => res.json(rows[0]))
  })

  router.delete('/:sessionId', (req, res) => {
    const sessionId = req.params.sessionId;
    return db.deleteSession(req.currentUser, sessionId)
             .then(rows => res.json(rows[0]));
  })

  return router;
}