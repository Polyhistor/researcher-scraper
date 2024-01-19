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
      "https://ltl.lincoln.ac.nz/about-us/staff/?sortBy=name",
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
          const emailSelector =
            'ul[data-cy="results-list"] li > div > div > span:last-child';

          const emailsElements = await page.$$eval(emailSelector, (elements) =>
            elements.map((element) => {
              const email = element.textContent.trim();
              return email;
            })
          );

          for (const emailElement of emailsElements) {
            emails.add(emailElement);
          }

          console.log(emails);

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
