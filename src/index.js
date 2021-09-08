const express = require('express');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');

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
app.get('/test', (req, res) => {
  console.log('getting test')
  res.json({ you: "got the test response"})
});

// Tester route to look at DB data to make sure DB is seeding properly.
// REMOVE BEFORE LIVE PUSH
app.get('/api/users', (req, res) => {
  dbObj.query(`SELECT * FROM projects`, [])
    .then(rows => res.json(rows))
})

// Attempt to log in a user from a cookie session.
app.post('/api/authenticate', (req,res) => {
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
  db.validLogin(username, rawPassword) // Check login validity, true/false response
    .then(valid => valid ? db.getIdByUsername(username) : null) // Return the id or a null
    .then(id => {
      req.session.userId = id; // Set the cookie (either to the id or to null)
      const response = id ? { username } : { username: null };
      res.json(response);
    })
})


// Log out the current user.
app.post('/api/logout', (req, res) => {
  console.log('In route POST /api/logout');
  req.session.userId = null;
  res.json({ username:null });
})

// Register a new user.
app.post('/api/users', (req, res) => {
  // Register a new user with username and password.
  // Hash the password first!
  console.log('In route POST /api/users')
  const { username, rawPassword } = req.body;
  db.addUser(username, rawPassword)
    .then(newUser => {
      // Set a cookie and return the username if the registration is successful.
      const { username, id } = newUser;
      req.session.userId = id;
      res.json({ username })
    })
})

app.get('/api/projects', (req, res) => {
  // Get all projects for currently-logged-in user.
  const userId = req.session.userId;
  db.getProjectsByUser(userId)
    .then(projects => res.json({ projects }))
})

app.post('/api/projects', (req, res) => {
  // Create a new project for the currently-logged-in user.
  const userId = req.session.userId;
  const { projectTitle } = req.body
  db.addProject(userId, projectTitle)
    .then(project => res.json(project))
})

app.patch('/api/projects/:id', (req, res) => {
  const userId = req.session.userId;
  const projectId = req.params.id;
  const { title } = req.body;
  console.log(`updating ${projectId} to have title ${title}`);
  db.updateProjectTitle(userId, projectId, title)
    .then(rows => res.json(rows[0]))
})

// Get this week's blocks for current user.
app.get('/api/blocks/week', (req, res) => {
  // If a date is supplied, use that date as the target.
  // Otherwise, we use today's date.
  const targetDate = req.query.date ? new Date(req.query.date) : new Date();

  const userId = req.session.userId;
  db.getWeeklyBlocksByUser(userId, targetDate)
    .then(data => res.json(data));
});

app.post('/api/blocks', (req, res) => {
  // Create a new block for the currently-logged-in user.
  // Get the project ID from the request.
})

app.get('/api/sessions/week', (req, res) => {
  const userId = req.session.userId;
  const targetDate = req.query.date ? new Date(req.query.date) : new Date();
  return db.getWeeklySessions(userId, targetDate)
           .then(data => res.json(data))
})

app.post('/api/sessions', (req, res) => {
  // Start a new session for the current user.
  // Get the project ID from the request.
  const userId = req.session.userId;
  const { project_id } = req.body;
  db.startSession({ user_id: userId, project_id })
    .then(data => res.json(data))
})

app.patch('/api/sessions', (req, res) => {
  // Stop a currently-running session.
  const userId = req.session.userId;
  const sessionId = req.body.session_id;
  db.stopSession(userId, sessionId)
           .then(rows => res.json(rows[0]))
})

app.get(`/api/reports/week`, (req, res) => {
  const userId = req.session.userId;
  const targetDate = req.query.date ? new Date(req.query.date) : new Date();
  return db.getWeeklyReport(userId, targetDate)
           .then(data => res.json(data))
})

http.listen(port, () => console.log(`Listening on port ${port}`));
