const express = require('express');

module.exports = function (db) {
  const router = express.Router();
  // Register a new user.
  router.post('/', (req, res) => {
    // Register a new user with username and password.
    // Hash the password first!
    const { username, rawPassword } = req.body;
    db.addUser(username, rawPassword)
      .then(newUser => {
        // Set a cookie and return the username if the registration is successful.
        const { username, id } = newUser;
        req.session.userId = id;
        res.json({ username })
      })
  })

  return router;
}
