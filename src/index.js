const express = require('express');
const cookieSession = require('cookie-session');

const app = express();
const http = require('http').Server(app);
const port = process.env.PORT || 8080;

app.use(cookieSession({
  name: 'session',
  keys: ['userId']
}))

// db provides the query(), insert(), and update() functions.
const db = require('./db')

// Tester route to make sure the server runs.
/* app.get('/test', (req, res) => {
  console.log('getting test')
  res.json({ you: "got the test response"})
}); */

// Tester route to make sure the DB is seeded.
/* app.get('/api/users', (req, res) => {
  db.query(`SELECT * FROM users`, [])
    .then(rows => res.json(rows))
}) */

// Attempt to log in a user from a cookie session.
app.post('/api/authenticate', (req,res) => {
  if (req.session.userId) {
    // Look up the userId in the database. If there's a match, return the username and leave the cookie alone.
    db.query(`SELECT username FROM users WHERE id = $1`, [req.session.userId])
      .then(rows => {
        console.log(rows)
        if (rows[0]) {
          res.json(rows[0]);
        } else {
          // If there's not a match, clear the cookie and return null.
          req.session.userId = null;
          res.json({username: null});
        }
      });
  } else {
    res.json({username: null})
  }
  // Set a cookie if the login is successful.
})

app.post('/api/users', (req, res) => {
  // Register a new user with username and password.
  // Hash the password first!
  // Set a cookie if the registration is successful.
})

app.post('/api/projects', (req, res) => {
  // Create a new project for the currently-logged-in user.
})

app.post('/api/blocks', (req, res) => {
  // Create a new block for the currently-logged-in user.
  // Get the project ID from the request.
})

app.post('/api/sessions', (req, res) => {
  // Start a new session for the current user.
  // Get the project ID from the request.
})

http.listen(port, () => console.log(`Listening on port ${port}`));
