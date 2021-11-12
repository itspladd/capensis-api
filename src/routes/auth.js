const express = require('express');

module.exports = function (db) {
  const router = express.Router();
  // Attempt to log in a user from a cookie session.
  router.post('/', (req,res) => {
    // If we have a cookie...
    if (req.session.userId) {
      // Look up the userId in the database.
      db.getUsernameById(req.session.userId)
        .then(username => {
          // If we got a null result, set the cookie to null.
          if (!username) {
            req.session.userId = null;
          }
          // Regardless, send back the username (even if it's null - the client knows how to handle it)
          res.json({ username });
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
      .then(valid => valid ? db.getIdByUsername(username) : null) // Return the id or a null
      .then(id => {
        req.session.userId = id; // Set the cookie (either to the id or to null)
        const response = id ? { username } : { username: null };
        res.json(response);
      })
  })

  // Log out the current user.
  router.post('/logout', (req, res) => {
    req.session.userId = null;
    res.json({ username:null });
  })

  return router;
}
