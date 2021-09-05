module.exports = function (db) {

  const getUsernameById = id => {
    return db.query(`SELECT username FROM users WHERE id = $1`, [id])
             .then(rows => {
               if (rows[0]) {
                 return rows[0].username
               } else {
                 return null;
               }
             })
  }

  // The user parameter must have two keys: "username" and "hashed_password"
  const addUser = user => {
    return db.insert(`users`, user)
             .then(rows => rows[0]);
  }

  return {
    getUsernameById,
    addUser
  }
}