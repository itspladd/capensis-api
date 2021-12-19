const express = require('express');

module.exports = function (db) {
  const router = express.Router();
  // Attempt to log in a user from a cookie session.
  router.post('/', (req,res) => {
    // If we have a cookie...
    if (req.session.userId) {
      // Look up the userId in the database.
      db.getUserById(req.session.userId)
        .then(user => {
          // If we got a null result, set the cookie to null.
          if (!user) {
            req.session.userId = null;
          }
          // Regardless, send back the user (even if it's null - the client knows how to handle it)
          res.json({ user });
        });
    } else {
      // If we don't have a cookie, send back a null username.
      res.json({username: null})
    }
  })

  // Attempt to validate a user with a supplied username/password.
  router.post('/login', (req, res) => {
    const { username, rawPassword } = req.body;
    db.validLogin(username, rawPassword) // Check login validity, true/false response
      .then(valid => valid ? db.getUserByUsername(username) : null) // Return the id or a null
      .then(user => {
        // If login was successful, set cookie. Otherwise, clear cookie.
        req.session.userId = user ? user.id : null;
        res.json({ user });
      })
  })

  // Log out the current user.
  router.post('/logout', (req, res) => {
    req.session.userId = null;
    res.json({ username:null });
  })

  return router;
}
