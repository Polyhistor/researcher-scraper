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

    const staffPageUrl =
      "https://www.nus.edu.sg/celc/academic-staff-full-time/";

    await page.goto(staffPageUrl, { waitUntil: "networkidle0" });

    // Selector adjusted for the NUS CELC academic staff page structure
    const emailSelector = '.single-staff .staff-mail[href^="mailto:"]';

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
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    if (browser) {
      await browser.close();
    }
    cleanUp(db, browser);
  }
})();
