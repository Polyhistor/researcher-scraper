import puppeteer from "puppeteer";
import { startupTheService } from "./startupTheService";
import { cleanUp } from "./cleanup";
import { insertEmail } from "./insertEmailIntoDB";

(async () => {
  let browser;
  const db = startupTheService();

  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0...");

    // Base URL for NTU's faculty directory
    const baseUrl =
      "https://www.ntu.edu.sg/research/faculty-directory?searchFaculty=&interests=all&page=";

    // Iterate through pages 1 to 100
    for (let i = 1; i <= 100; i++) {
      const currentPageUrl = `${baseUrl}${i}`;

      await page.goto(currentPageUrl, { waitUntil: "networkidle0" });

      // Selector adapted for the NTU faculty directory structure
      const emailSelector = '.img-card__body .email-label[href^="mailto:"]';

      const emails = await page.$$eval(emailSelector, (links) =>
        links.map((link) => link.textContent.trim())
      );

      for (const email of emails) {
        try {
          await insertEmail(db, email);
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
    cleanUp(db, browser);
  }
})();
