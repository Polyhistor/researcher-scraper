export const insertEmail = (db, email) => {
  return new Promise((resolve, reject) => {
    // First, check if the email already exists
    db.get(`SELECT email FROM emails WHERE email = ?`, [email], (err, row) => {
      if (err) {
        reject(err.message);
      } else if (row) {
        // Email already exists, so resolve with a message or an identifier
        resolve("Email already exists");
      } else {
        // Email does not exist, insert it with emailSent set to 0
        db.run(
          `INSERT INTO emails (email, emailSent) VALUES (?, 0)`,
          [email],
          function (err) {
            if (err) {
              reject(err.message);
            } else {
              resolve(this.lastID); // Resolve with the new row's ID
            }
          }
        );
      }
    });
  });
};
