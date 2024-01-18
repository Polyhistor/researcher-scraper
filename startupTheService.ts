import sqlite3 from "sqlite3";

export const startupTheService = () => {
  // Create a new database (if it doesn't exist) and open it
  let db = new sqlite3.Database(
    "./emails.db",
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err) {
        console.error(err.message);
      }
      console.log("Connected to the SQLite database.");
    }
  );

  // Create a table to store emails (if it doesn't exist)
  db.run(
    `CREATE TABLE IF NOT EXISTS emails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL
    )`,
    (err) => {
      if (err) {
        console.error(err.message);
      }
    }
  );

  return db;
};
