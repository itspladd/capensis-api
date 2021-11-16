const express = require('express');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const http = require('http').Server(app);
const port = process.env.PORT || 8080;

const corsOptions = {
  origin: ["https://www.pladd.dev"],
  credentials: true,
}

app.use(cors(corsOptions))

app.set('trust proxy', 1)

// Cookie session: for tracking the current user session.
app.use(cookieSession({
  name: 'session',
  keys: ['userId'],
  sameSite: process.env.PORT ? 'none' : 'lax'
}))

// Body parser: for receiving data in POST requests.
app.use(bodyParser.json())

app.use((req, res, next) => {
  req.currentUser = req.session.userId;
  next();
})

// The "dbObj" object provides query(), insert(), and update() functions to interact with the PSQL database.
const dbObj = require('./db')
const helpers = require('./helpers')
const dbHelpersBuilder = require('./db/helpers'); // Grab the helper builder function
const db = dbHelpersBuilder(dbObj, helpers); // Give the db object to the builder to make the helper functions

// Routes
const authRoutes = require('./routes/auth')(db)
const blockRoutes = require('./routes/blocks')(db)
const projectRoutes = require('./routes/projects')(db)
const reportRoutes = require('./routes/reports')(db)
const sessionRoutes = require('./routes/sessions')(db)
const userRoutes = require('./routes/users')(db)

app.use('/api/auth', authRoutes)
app.use('/api/blocks', blockRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/sessions', sessionRoutes)
app.use('/api/users', userRoutes)

// Tester route to make sure the server runs.
app.get('/test', (req, res) => {
  console.log('getting test')
  res.json({ you: "got the test response"})
});











http.listen(port, () => console.log(`Listening on port ${port}`));
