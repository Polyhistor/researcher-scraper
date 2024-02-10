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

    const url = "https://econ.wisc.edu/people/phd-student-directory/";
    await page.goto(url, { waitUntil: "networkidle2" });

    // Extract emails from the page
    const emails = await page.$$eval(
      '.faculty-member-content p a[href^="mailto:"]',
      (links) => links.map((link) => link.textContent.trim())
    );

    console.log(`Extracted emails:`, emails);

    for (const email of emails) {
      try {
        await insertEmail(db, email); // Insert each email into the database
        console.log(`Inserted email: ${email}`);
      } catch (error) {
        console.error(`Error inserting email ${email}: `, error);
      }
    }
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    if (browser) {
      await browser.close();
    }
    cleanUp(browser, db); // Ensure to close your database connection properly
  }
})();
