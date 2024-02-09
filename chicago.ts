import puppeteer from "puppeteer";
import { startupTheService } from "./startupTheService";
import { cleanUp } from "./cleanup";
import { insertEmail } from "./insertEmailIntoDB";

(async () => {
  let browser;

  try {
    // Initialize the database service
    const db = startupTheService();

    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0...");

    const urls = [
      "https://crownschool.uchicago.edu/research-faculty/phd-student-directory?page=0",
      "https://crownschool.uchicago.edu/research-faculty/phd-student-directory?page=1",
      "https://crownschool.uchicago.edu/research-faculty/phd-student-directory?page=2",
      "https://crownschool.uchicago.edu/research-faculty/phd-student-directory?page=3",
    ];

    for (const url of urls) {
      await page.goto(url, { waitUntil: "networkidle2" });
      const pageEmails = await page.$$eval(
        'div.card-details > p > a[href^="mailto:" i]',
        (anchors) => anchors.map((a) => a.textContent.trim())
      );

      console.log(pageEmails);

      for (const email of pageEmails) {
        try {
          await insertEmail(db, email); // Assume insertEmail(db, email) is a valid function for your database
          console.log(`Inserted email: ${email}`);
        } catch (error) {
          console.error(`Error inserting email ${email}: `, error);
        }
      }
    }
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    if (browser) {
      await browser.close();
    }
    cleanUp(browser, db); // Assume cleanUp(db) properly closes any database connection
  }
})();
