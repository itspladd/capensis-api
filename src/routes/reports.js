const express = require('express')

module.exports = function (db) {
  const router = express.Router()

  router.get(`/week`, (req, res) => {
    const userId = req.session.userId;
    const targetDate = req.query.date ? new Date(req.query.date) : new Date();
    return db.getWeeklyReport(userId, targetDate)
             .then(data => res.json(data))
  })

  return router
}