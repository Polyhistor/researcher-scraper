import puppeteer from "puppeteer";
import { startupTheService } from "./startupTheService";
import { cleanUp } from "./cleanup";
import { insertEmail } from "./insertEmailIntoDB";

(async () => {
  const db = startupTheService();
  let browser;

  try {
    // Launch Puppeteer in headless mode for better performance
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Navigate to the PhD students page
    const url =
      "https://crownschool.uchicago.edu/research-faculty/phd-student-directory";
    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 60000,
    });

    // Extract emails directly from the table structure
    const emails = await page.$$eval(
      'tr > td:nth-child(2) > a[href^="mailto:"]',
      (anchors) => anchors.map((a) => a.textContent.trim())
    );

    // Process extracted emails
    if (emails.length > 0) {
      for (const email of emails) {
        try {
          await insertEmail(db, email);
        } catch (error) {
          console.error(`Error inserting email ${email}: `, error);
        }
      }
    } else {
      console.log("No emails found.");
    }
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    if (browser) {
      await browser.close();
    }
    cleanUp(browser, db);
  }
})();
