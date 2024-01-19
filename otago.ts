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
      "https://www.otago.ac.nz/contacts/letters?s=%21null&s=%21null&f.A-Z%7CfirstLetterSurname=a&profile=staff-directory-search-results&profile=staff-directory-search-results&num_ranks=1000&num_ranks=1000&meta_phonebookType=Person&meta_phonebookType=Person&fmo=1&fmo=1&collection=uoot-prod%7Esp-staff-directory-search&sort=metapeopleLastName&sort=metapeopleLastName",
      "https://www.otago.ac.nz/contacts/letters?s=%21null&s=%21null&f.A-Z%7CfirstLetterSurname=b&profile=staff-directory-search-results&profile=staff-directory-search-results&num_ranks=1000&num_ranks=1000&meta_phonebookType=Person&meta_phonebookType=Person&fmo=1&fmo=1&collection=uoot-prod%7Esp-staff-directory-search&sort=metapeopleLastName&sort=metapeopleLastName",
      "https://www.otago.ac.nz/contacts/letters?s=%21null&s=%21null&f.A-Z%7CfirstLetterSurname=c&profile=staff-directory-search-results&profile=staff-directory-search-results&num_ranks=1000&num_ranks=1000&meta_phonebookType=Person&meta_phonebookType=Person&fmo=1&fmo=1&collection=uoot-prod%7Esp-staff-directory-search&sort=metapeopleLastName&sort=metapeopleLastName",
      "https://www.otago.ac.nz/contacts/letters?s=%21null&s=%21null&f.A-Z%7CfirstLetterSurname=d&profile=staff-directory-search-results&profile=staff-directory-search-results&num_ranks=1000&num_ranks=1000&meta_phonebookType=Person&meta_phonebookType=Person&fmo=1&fmo=1&collection=uoot-prod%7Esp-staff-directory-search&sort=metapeopleLastName&sort=metapeopleLastName",
      "https://www.otago.ac.nz/contacts/letters?s=%21null&s=%21null&f.A-Z%7CfirstLetterSurname=e&profile=staff-directory-search-results&profile=staff-directory-search-results&num_ranks=1000&num_ranks=1000&meta_phonebookType=Person&meta_phonebookType=Person&fmo=1&fmo=1&collection=uoot-prod%7Esp-staff-directory-search&sort=metapeopleLastName&sort=metapeopleLastName",
      "https://www.otago.ac.nz/contacts/letters?s=%21null&s=%21null&f.A-Z%7CfirstLetterSurname=f&profile=staff-directory-search-results&profile=staff-directory-search-results&num_ranks=1000&num_ranks=1000&meta_phonebookType=Person&meta_phonebookType=Person&fmo=1&fmo=1&collection=uoot-prod%7Esp-staff-directory-search&sort=metapeopleLastName&sort=metapeopleLastName",
      "https://www.otago.ac.nz/contacts/letters?s=%21null&s=%21null&f.A-Z%7CfirstLetterSurname=g&profile=staff-directory-search-results&profile=staff-directory-search-results&num_ranks=1000&num_ranks=1000&meta_phonebookType=Person&meta_phonebookType=Person&fmo=1&fmo=1&collection=uoot-prod%7Esp-staff-directory-search&sort=metapeopleLastName&sort=metapeopleLastName",
      "https://www.otago.ac.nz/contacts/letters?s=%21null&s=%21null&f.A-Z%7CfirstLetterSurname=h&profile=staff-directory-search-results&profile=staff-directory-search-results&num_ranks=1000&num_ranks=1000&meta_phonebookType=Person&meta_phonebookType=Person&fmo=1&fmo=1&collection=uoot-prod%7Esp-staff-directory-search&sort=metapeopleLastName&sort=metapeopleLastName",
      "https://www.otago.ac.nz/contacts/letters?s=%21null&s=%21null&f.A-Z%7CfirstLetterSurname=i&profile=staff-directory-search-results&profile=staff-directory-search-results&num_ranks=1000&num_ranks=1000&meta_phonebookType=Person&meta_phonebookType=Person&fmo=1&fmo=1&collection=uoot-prod%7Esp-staff-directory-search&sort=metapeopleLastName&sort=metapeopleLastName",
      "https://www.otago.ac.nz/contacts/letters?s=%21null&s=%21null&f.A-Z%7CfirstLetterSurname=j&profile=staff-directory-search-results&profile=staff-directory-search-results&num_ranks=1000&num_ranks=1000&meta_phonebookType=Person&meta_phonebookType=Person&fmo=1&fmo=1&collection=uoot-prod%7Esp-staff-directory-search&sort=metapeopleLastName&sort=metapeopleLastName",
      "https://www.otago.ac.nz/contacts/letters?s=%21null&s=%21null&f.A-Z%7CfirstLetterSurname=k&profile=staff-directory-search-results&profile=staff-directory-search-results&num_ranks=1000&num_ranks=1000&meta_phonebookType=Person&meta_phonebookType=Person&fmo=1&fmo=1&collection=uoot-prod%7Esp-staff-directory-search&sort=metapeopleLastName&sort=metapeopleLastName",
      "https://www.otago.ac.nz/contacts/letters?s=%21null&s=%21null&f.A-Z%7CfirstLetterSurname=l&profile=staff-directory-search-results&profile=staff-directory-search-results&num_ranks=1000&num_ranks=1000&meta_phonebookType=Person&meta_phonebookType=Person&fmo=1&fmo=1&collection=uoot-prod%7Esp-staff-directory-search&sort=metapeopleLastName&sort=metapeopleLastName",
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
            '.card .card__body__tagline p a[href^="mailto:"]';

          const emailsElements = await page.$$eval(emailSelector, (elements) =>
            elements.map((element) => {
              const email = element.textContent.trim();
              return email;
            })
          );

          for (const emailElement of emailsElements) {
            emails.add(emailElement);
          }

          // total garbage I know :P
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
