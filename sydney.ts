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

    // Main academic staff page
    const mainPageUrl =
      "https://www.sydney.edu.au/science/about/our-people/academic-staff.html";

    // Go to the main page and collect profile URLs
    await page.goto(mainPageUrl, { waitUntil: "networkidle0" });
    const profileUrls = await page.$$eval(
      'ul > li.grid__cell > a[target="_blank"]',
      (links) => links.map((link) => link.href)
    );

    const emails = new Set();

    for (const profileUrl of profileUrls) {
      try {
        await page.goto(profileUrl, { waitUntil: "networkidle0" });

        // Check if the email selector exists on the page
        const emailExists = await page.$('div.b-list-group a[href^="mailto:"]');
        if (emailExists) {
          // Extract the email address from the profile page
          const email = await page.$eval(
            'div.b-list-group a[href^="mailto:"]',
            (el) => el.textContent.trim()
          );
          try {
            await insertEmail(db, email);
          } catch (error) {
            console.error(`Error inserting email ${email}: `, error);
          }
        } else {
          console.log(`No email found for profile: ${profileUrl}`);
        }
      } catch (error) {
        console.error(`Error on profile page ${profileUrl}: `, error);
      }
    }

    console.log(emails);
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
