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

    await page.goto(
      "https://rossier.usc.edu/programs/doctoral-degree-programs/directory",
      { waitUntil: "networkidle2" }
    );
    let hasNextPage = true;

    while (hasNextPage) {
      // Extract emails from the current page
      const pageEmails = await page.$$eval(
        'div.contact-block ul.icon-list li a[href^="mailto:"]',
        (links) => links.map((link) => link.textContent.trim())
      );
      console.log(pageEmails);

      for (const email of pageEmails) {
        try {
          await insertEmail(db, email);
          console.log(`Inserted email: ${email}`);
        } catch (error) {
          console.error(`Error inserting email ${email}: `, error);
        }
      }

      // Check for and click the "Next" button, if it exists
      const nextPageButton = await page.$("li.pager__item--next a");
      if (nextPageButton) {
        await nextPageButton.click();
        await page.waitForNavigation({ waitUntil: "networkidle2" });
      } else {
        hasNextPage = false;
      }
    }
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    if (browser) {
      await browser.close();
    }
    cleanUp(db); // Ensure to close your database connection properly
  }
})();
