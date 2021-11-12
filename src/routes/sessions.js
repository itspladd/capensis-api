const express = require('express');

module.exports = function (db) {
  const router = express.Router();

  router.post('/', (req, res) => {
    // Start a new session for the current user.
    // Get the project ID from the request.
    const userId = req.session.userId;
    const { project_id } = req.body;
    db.startSession({ user_id: userId, project_id })
      .then(data => res.json(data))
  })

  router.patch('/', (req, res) => {
    // Stop a currently-running session.
    const userId = req.session.userId;
    const sessionId = req.body.session_id;
    db.stopSession(userId, sessionId)
             .then(rows => res.json(rows[0]))
  })

  // Return all sessions for a given week
  router.get('/week', (req, res) => {
    // If a date is supplied, use that date as the target.
    // Otherwise, we use today's date.
    const targetDate = req.query.date ? new Date(req.query.date) : new Date();
    const userId = req.session.userId;
    return db.getWeeklySessions(userId, targetDate)
             .then(data => res.json(data))
  })

  // Get the most recent session that is still running for this user, if any.
  router.get('/current', (req, res) => {
    const userId = req.session.userId;
    const targetDate = req.query.date ? new Date(req.query.date) : new Date();
    return db.getCurrentSession(userId)
             .then(session => res.json(session))
  })

  router.patch('/:sessionId', (req, res) =>{
    // Change the start or stop time of a session.
    const user_id = req.session.userId;
    const session_id = req.params.sessionId;
    const { start_time, end_time } = req.body;
    return db.updateSession({ session_id, start_time, end_time })
             .then(rows => res.json(rows[0]))
  })

  router.delete('/:sessionId', (req, res) => {
    const userId = req.session.userId;
    const sessionId = req.params.sessionId;
    return db.deleteSession(userId, sessionId)
             .then(rows => res.json(rows[0]));
  })

  return router;
}