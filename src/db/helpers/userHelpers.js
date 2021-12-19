const bcrypt = require('bcrypt')

module.exports = function (db) {
  const getUserById = id => {
    return db.query(`SELECT username FROM users WHERE id = $1`, [id])
             .then(rows => {
               if (rows[0]) {
                 return rows[0]
               } else {
                 return null;
               }
             })
  };

  const getUserByUsername = username => {
    return db.query(`SELECT username, id FROM users WHERE username = $1`, [username])
             .then(rows => {
               if (rows[0]) {
                 return rows[0];
               } else {
                 return null;
               }
             })
  };

  // The user parameter must have two keys: "username" and "hashed_password"
  const addUser = (username, rawPassword) => {
    const saltRounds = 10;
    return bcrypt.hash(rawPassword, saltRounds)
                 .then(hashed_password => db.insert(`users`, {username, hashed_password}))
                 .then(rows => rows[0])
  };

  const validLogin = (username, rawPassword) => {
    // Find the hashed password matching the username
    return db.query(`SELECT hashed_password FROM users WHERE username = $1`, [username])
             .then(rows => {
               // If there's a matching user, check the password and return result
               if (rows[0]) {
                const { hashed_password } = rows[0];
                return bcrypt.compare(rawPassword, hashed_password);
               } else {
                // If there's no result, return false
                return false;
               }
             });
  };

  return {
    addUser,
    getUserById,
    getUserByUsername,
    validLogin
  }
}

