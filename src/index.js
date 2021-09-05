const express = require('express');
const app = express();
const http = require('http').Server(app);

const port = process.env.PORT || 8080;
const db = require('./db')


console.log("Server running!")


app.get('/', (req, res) => {
  res.json({ you: "are on the root page"})
});

app.get('/api/users', (req, res) => {
  db.query(`SELECT * FROM users`, [])
    .then(rows => res.json(rows))
})

app.get('/api/games', (req, res) => {
  db.query(`SELECT * FROM games`, [])
    .then(rows => res.json(rows))
})

app.get('/api/boards', (req, res) => {
  db.query(`SELECT * FROM boards`, [])
    .then(rows => res.json(rows))
})

app.get('/api/rulesets', (req, res) => {
  db.query(`SELECT * FROM rulesets`, [])
    .then(rows => res.json(rows))
})

app.get('/backend-test', (req, res) => {
  res.send({ msg: 'Successful connection!' })
});


http.listen(port, () => console.log(`Listening on port ${port}`));
