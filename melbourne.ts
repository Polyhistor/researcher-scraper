import puppeteer from "puppeteer";
import { startupTheService } from "./startupTheService";
import { cleanUp } from "./cleanup";
import { insertEmail } from "./insertEmailIntoDB";

(async () => {
  let browser;
  // Initialise the database
  const db = startupTheService();

  try {
    // Start Puppeteer
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Define the URL to scrape
    const academicStaffsPage =
      "https://sgeas.unimelb.edu.au/about/people/academic-staff";

    try {
      const response = await page.goto(academicStaffsPage, {
        waitUntil: "networkidle0",
        timeout: 30000,
      });

      console.log(response.status());

      if (response && response.ok()) {
        // Wait for the page to load completely
        const emailSelector = 'td[data-label="Email"] a[href^="mailto:"]';

        const emailsElements = await page.$$eval(emailSelector, (elements) =>
          elements.map((element) => element.textContent.trim())
        );

        for (const email of emailsElements) {
          try {
            await insertEmail(db, email);
          } catch (error) {
            console.error(`Error inserting email ${email}: `, error);
          }
        }
      }
    } catch (error) {
      console.error(
        `Error on academic staff page ${academicStaffsPage}: `,
        error
      );
    }
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    if (browser) {
      await browser.close();
    }

    // Clean up the database connection
    cleanUp(db, browser);
  }
})();
