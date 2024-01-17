export const cleanUp = async (db, browser) => {
  // Close the database connection
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("Close the database connection.");
  });

  await browser.close();
};
