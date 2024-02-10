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

    const letters = Array.from({ length: 26 }, (_, i) =>
      String.fromCharCode(65 + i)
    ); // Creates an array with letters A-Z

    for (const letter of letters) {
      const url = `https://www.waynesburg.edu/our-story/faculty-staff-directory?letter=${letter}`;
      await page.goto(url, { waitUntil: "networkidle2" });

      // Extract emails from the current page
      const emails = await page.$$eval(".listing-card__email", (elements) =>
        elements.map((element) => element.textContent.trim())
      );

      for (const email of emails) {
        try {
          await insertEmail(db, email); // Insert each email into the database
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
    cleanUp(browser, db); // Ensure to close your database connection properly
  }
})();
