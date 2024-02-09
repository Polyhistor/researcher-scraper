import puppeteer from "puppeteer";
import { startupTheService } from "./startupTheService";
import { cleanUp } from "./cleanup";
import { insertEmail } from "./insertEmailIntoDB";

(async () => {
  const db = startupTheService();
  let browser;

  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0...");

    // Define all the staff pages to scrape
    const staffPagesUrls = [
      "https://www.tudelft.nl/citg/over-faculteit/afdelingen/geoscience-engineering/staff/academic-staff",
      "https://www.tudelft.nl/citg/over-faculteit/afdelingen/geoscience-engineering/staff/research-staff",
      "https://www.tudelft.nl/citg/over-faculteit/afdelingen/geoscience-engineering/staff/phd-students",
    ];

    let emails = [];

    // Iterate over each staff page URL
    for (const staffPageUrl of staffPagesUrls) {
      await page.goto(staffPageUrl, {
        waitUntil: "networkidle0",
      });

      // Collect all profile anchor links from the current staff page
      const profileLinks = await page.$$eval(
        "a.card--horizontalHalfHeight",
        (links) => links.map((link) => link.href)
      );

      // Loop through each profile link, navigate to the page and extract the email
      for (const link of profileLinks) {
        let profilePage = null;
        try {
          profilePage = await browser.newPage();
          await profilePage
            .goto(link, { waitUntil: "networkidle0" })
            .catch((e) => {
              console.error(`Failed to load profile at ${link}:`, e.message);
              throw new Error("NavigationError");
            });

          let email = null;
          try {
            email = await profilePage.$eval(
              'div[data-webidentification] a[href^="mailto:"]',
              (a) => a.textContent.trim()
            );
          } catch (e) {
            console.error(
              `Email not found or failed to extract for profile at ${link}:`,
              e.message
            );
          }

          if (email) {
            emails.push(email);
          }
        } catch (e) {
          if (e.message !== "NavigationError") {
            console.error(
              `Unexpected error processing profile at ${link}:`,
              e.message
            );
          }
        } finally {
          if (profilePage) {
            await profilePage.close();
          }
        }
      }
    }

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
