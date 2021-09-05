const express = require('express');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const app = express();
const http = require('http').Server(app);
const port = process.env.PORT || 8080;

// Cookie session: for tracking the current user session.
app.use(cookieSession({
  name: 'session',
  keys: ['userId']
}))

// Body parser: for receiving data in POST requests.
app.use(bodyParser.json())

// The "dbObj" object provides query(), insert(), and update() functions to interact with the PSQL database.
const dbObj = require('./db')
const dbHelpersBuilder = require('./db/dbHelpers'); // Grab the helper builder function
const db = dbHelpersBuilder(dbObj); // Give the db object to the builder to make the helper functions

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
  req.session.userId = 1;
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
app.post('/api/login', (req, res) => {
  console.log('In route POST /api/login')
  const { username, rawPassword } = req.body;
  console.log(username, rawPassword)
})

// Register a new user.
app.post('/api/users', (req, res) => {
  // Register a new user with username and password.
  // Hash the password first!
  console.log('In route POST /api/users')
  const { username, rawPassword } = req.body;
  const saltRounds = 10;
  bcrypt.hash(rawPassword, saltRounds)
        .then(hash => console.log(hash))
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
