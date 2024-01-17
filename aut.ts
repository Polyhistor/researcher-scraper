import puppeteer from "puppeteer";
import sqlite3 from "sqlite3";
import { cleanUp } from "./cleanup";

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

// Function to insert an email into the database
function insertEmail(email) {
  return new Promise((resolve, reject) => {
    db.run(`INSERT INTO emails (email) VALUES (?)`, [email], function (err) {
      if (err) {
        reject(err.message);
      } else {
        resolve(this.lastID);
      }
    });
  });
}

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );

  const academicStaffsPages = [
    "https://www.aut.ac.nz/study/study-options/engineering-computer-and-mathematical-sciences/academic-staff/mechanical-engineering-department",
    "https://aut.ac.nz/study/study-options/engineering-computer-and-mathematical-sciences/academic-staff/mathematical-sciences-department",
    "https://www.aut.ac.nz/study/study-options/engineering-computer-and-mathematical-sciences/academic-staff/electrical-and-electronic-engineering-department",
    "https://www.aut.ac.nz/study/study-options/engineering-computer-and-mathematical-sciences/academic-staff/mathematical-sciences-department",
    "https://www.aut.ac.nz/study/study-options/art-and-design/academic-staff",
  ];

  for (const academicStaffsPage of academicStaffsPages) {
    console.log(academicStaffsPage);

    // Navigate to the main page
    await page.goto(academicStaffsPage);

    // Extract the URLs of each staff member
    const staffUrls = await page.$$eval("div #mainContent div p a", (links) =>
      links.map((link) => link.href)
    );

    const emails = new Set();
    console.log(staffUrls);

    for (const staffUrl of staffUrls) {
      await page.goto(staffUrl, { waitUntil: "networkidle0" });

      // Click the button to show the email address
      await page.click('button[data-qa="emailModalButton"]');

      // Selecting the email
      await page.waitForSelector('div span a[href^="mailto:"');

      // Select the anchor tag
      const emailAnchor = await page.$('div span a[href^="mailto:"]');

      // Collectin the email
      let email;

      if (emailAnchor) {
        email = await page.evaluate(
          (element) => element.textContent,
          emailAnchor
        );
      }

      emails.add(email);
    }

    // Insert emails into the database
    for (let email of emails) {
      insertEmail(email)
        .then((id) => console.log(`A row has been inserted with rowid ${id}`))
        .catch((error) => console.error(error));
    }
  }

  cleanUp(db, browser);
})();
