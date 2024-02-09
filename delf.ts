import puppeteer from "puppeteer";
import { startupTheService } from "./startupTheService";
import { cleanUp } from "./cleanup";
import { insertEmail } from "./insertEmailIntoDB";

(async () => {
  const db = startupTheService();
  let browser;

  try {
    browser = await puppeteer.launch({ headless: true, slowMo: 200 });
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0...");

    // Navigate to the staff directory page
    const staffPageUrl =
      "https://www.tudelft.nl/citg/over-faculteit/afdelingen/geoscience-engineering/staff/academic-staff";
    await page.goto(staffPageUrl, {
      waitUntil: "networkidle0",
      timeout: 60000,
    });

    // Collect all profile anchor links
    const profileLinks = await page.$$eval(
      "a.card--horizontalHalfHeight",
      (links) => links.map((link) => link.href)
    );

    // Initialize array to collect emails
    let emails = [];

    // Loop through each profile link, navigate to the page and extract the email
    for (const link of profileLinks) {
      try {
        const profilePage = await browser.newPage();
        await profilePage.goto(link, { waitUntil: "networkidle0" });

        // Extract the email address
        const email = await profilePage.$eval(
          'div[data-webidentification] a[href^="mailto:"]',
          (a) => a.textContent.trim()
        );

        if (email) {
          emails.push(email);
        }

        await profilePage.close();
      } catch (e) {
        console.error(`Failed to process profile at ${link}:`, e);
      }
    }

    console.log(emails);

    // Process extracted emails
    // if (emails.length > 0) {
    //   for (const email of emails) {
    //     try {
    //       await insertEmail(db, email);
    //     } catch (error) {
    //       console.error(`Error inserting email ${email}: `, error);
    //     }
    //   }
    // } else {
    //   console.log("No emails found.");
    // }
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    if (browser) {
      await browser.close();
    }
    cleanUp(browser, db);
  }
})();
