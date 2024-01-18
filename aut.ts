import puppeteer from "puppeteer";
import { startupTheService } from "./startupTheService";
import { cleanUp } from "./cleanup";
import { insertEmail } from "./insertEmailIntoDB";
import { startPupeeteer } from "./startPupeeteer";

(async () => {
  let browser;

  try {
    // Initialise the database
    const db = startupTheService();

    // Start Puppeteer
    browser = startPupeeteer();

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    const academicStaffsPages = [
      "https://www.aut.ac.nz/study/study-options/engineering-computer-and-mathematical-sciences/academic-staff/mechanical-engineering-department",
      // "https://aut.ac.nz/study/study-options/engineering-computer-and-mathematical-sciences/academic-staff/mathematical-sciences-department",
      // "https://www.aut.ac.nz/study/study-options/engineering-computer-and-mathematical-sciences/academic-staff/electrical-and-electronic-engineering-department",
      // "https://www.aut.ac.nz/study/study-options/engineering-computer-and-mathematical-sciences/academic-staff/mathematical-sciences-department",
      // "https://www.aut.ac.nz/study/study-options/art-and-design/academic-staff",
    ];

    for (const academicStaffsPage of academicStaffsPages) {
      try {
        await page.goto(academicStaffsPage, {
          waitUntil: "networkidle0",
          timeout: 30000,
        });

        const staffUrls = await page.$$eval(
          "div #mainContent div p a",
          (links) => links.map((link) => link.href)
        );

        const emails = new Set();

        console.log(staffUrls);

        for (const staffUrl of staffUrls) {
          try {
            const response = await page.goto(staffUrl, {
              waitUntil: "networkidle0",
              timeout: 30000,
            });

            console.log(response.status());

            if (response && response.ok()) {
              const emailButton = await page.$(
                'button[data-qa="emailModalButton"]'
              );
              if (emailButton) {
                await emailButton.click();

                try {
                  await page.waitForSelector('div span a[href^="mailto:"]', {
                    timeout: 10000,
                  });

                  const emailAnchor = await page.$(
                    'div span a[href^="mailto:"]'
                  );
                  if (emailAnchor) {
                    const email = await page.evaluate(
                      (el) => el.textContent,
                      emailAnchor
                    );
                    emails.add(email);
                  }
                } catch (e) {
                  if (e.name === "TimeoutError") {
                    console.log(`Email not found on page: ${staffUrl}`);
                  } else {
                    throw e; // re-throw the error if it is not a TimeoutError
                  }
                }
              }
            } else {
              console.log(`Failed to load page: ${staffUrl}`);
            }
          } catch (error) {
            console.error(`Error on page ${staffUrl}: `, error);
          }
        }

        for (let email of emails) {
          try {
            await insertEmail(db, email);
          } catch (error) {
            console.error(`Error inserting email ${email}: `, error);
          }
        }
      } catch (error) {
        console.error(
          `Error on academic staff page ${academicStaffsPage}: `,
          error
        );
      }
    }

    cleanUp(db, browser);
  } catch (error) {
    console.error("Global error:", error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
