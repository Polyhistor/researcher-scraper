// Function to insert an email into the database
export const insertEmail = (db, email) => {
  return new Promise((resolve, reject) => {
    db.run(`INSERT INTO emails (email) VALUES (?)`, [email], function (err) {
      if (err) {
        reject(err.message);
      } else {
        resolve(this.lastID);
      }
    });
  });
};
