import puppeteer from "puppeteer";
import { startupTheService } from "./startupTheService";
import { cleanUp } from "./cleanup";
import { insertEmail } from "./insertEmailIntoDB";

(async () => {
  let browser;

  try {
    // Initialise the database
    const db = startupTheService();

    // Start Puppeteer
    browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    const academicStaffsPages = [
      "https://www.massey.ac.nz/massey/expertise/college-staff-lists/college-of-humanities-and-social-sciences/school-of-humanities-media-and-creative-communication-staff/all-staff_home.cfm",
    ];

    const emails = new Set();

    for (const academicStaffsPage of academicStaffsPages) {
      try {
        const response = await page.goto(academicStaffsPage, {
          waitUntil: "networkidle0",
          timeout: 30000,
        });

        console.log(response.status());

        if (response && response.ok()) {
          // wait for the page to load completey
          const emailSelector = '.pf_short_email a[href^="mailto:"]';

          const emailsElements = await page.$$eval(emailSelector, (elements) =>
            elements.map((element) => element.textContent.trim())
          );

          for (const emailElement of emailsElements) {
            emails.add(emailElement);
          }

          //   total garbage I know :P
          for (let email of emails) {
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
    }
  } catch (error) {
    console.error("An error occured:", error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
