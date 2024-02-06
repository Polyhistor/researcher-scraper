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

    // Dynamically generate URLs for A to Z
    const baseDirectoryUrl = "https://www.heidelberg.edu/directory/";
    const alphabets = Array.from({ length: 26 }, (_, i) =>
      String.fromCharCode(i + 65)
    );
    const directoryPages = alphabets.map(
      (letter) => `${baseDirectoryUrl}${letter}`
    );

    for (const directoryPage of directoryPages) {
      try {
        const response = await page.goto(directoryPage, {
          waitUntil: "networkidle0",
          timeout: 30000,
        });

        console.log(
          `Visiting: ${directoryPage} - Status: ${response.status()}`
        );

        if (response && response.ok()) {
          // Adjusted email selector to match the new structure
          const emailSelector =
            ".field--name-field-email-address.field--type-email.field--label-hidden.field--item";

          const emails = await page.$$eval(emailSelector, (elements) =>
            elements.map((element) => element.textContent.trim())
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
        console.error(`Error on directory page ${directoryPage}: `, error);
      }
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
