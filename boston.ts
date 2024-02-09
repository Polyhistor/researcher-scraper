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

    // Navigate to the main directory page
    const directoryUrl =
      "https://www.bu.edu/econ/people/phd-student-directory/";
    await page.goto(directoryUrl, { waitUntil: "networkidle2" });

    // Extract all profile page URLs
    const profileUrls = await page.$$eval(
      "ul.profile-listing a.profile-link",
      (links) => links.map((link) => link.href)
    );

    for (const profileUrl of profileUrls) {
      await page.goto(profileUrl, { waitUntil: "networkidle2" });

      // Extract the email address from the profile page
      const email = await page.$eval(
        'li.profile-details-item.profile-details-email a[href^="mailto:"]',
        (emailLink) => emailLink.textContent.trim()
      );

      console.log(`Extracted email: ${email}`); // Logging extracted email

      // Insert the email into the database
      try {
        await insertEmail(db, email); // Assuming insertEmail(db, email) is a valid function for your database
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
    cleanUp(browser, db); // Assuming cleanUp(db) properly closes any database connection
  }
})();
