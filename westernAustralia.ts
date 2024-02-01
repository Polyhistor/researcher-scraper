import puppeteer from "puppeteer";
import { startupTheService } from "./startupTheService";
import { cleanUp } from "./cleanup";
import { insertEmail } from "./insertEmailIntoDB";

(async () => {
  let browser;
  // Initialize the database
  const db = startupTheService();

  try {
    // Launch Puppeteer
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    const emails = new Set();
    // Iterate over the specified UWA pages
    for (let i = 1; i <= 10; i++) {
      const uwaPageUrl = `https://research-repository.uwa.edu.au/en/persons/?page=${i}`;
      await page.goto(uwaPageUrl, { waitUntil: "networkidle0" });

      // Extract email addresses from each page
      const pageEmails = await page.$$eval(
        "div.result-container div.rendering_person_short ul.relations.email li.email a.email",
        (links) =>
          links.map((link) => {
            // Decode email information
            const emailMd5Data = link.getAttribute("data-md5");
            const emailText = link.textContent.trim();
            return `${emailText}@uwa.edu.au`; // Simplified for demonstration; actual decoding needed
          })
      );

      const cleanedEmails = pageEmails.map((email) => {
        // Step 1: Replace placeholders with correct symbols
        let correctedEmail = email
          .replace(/encryptedA\(\);/g, "@")
          .replace(/encryptedDot\(\);/g, ".");

        // Step 2: Fix emails with duplicated dots before "au"
        correctedEmail = correctedEmail.replace(/..au/g, ".au");

        // Step 3: Remove any extra @ signs and trailing parts if necessary
        // This step depends on the pattern of errors; adjust the regex as needed
        // Example: correcting "example@@domain.com..au@domain.com"
        correctedEmail = correctedEmail.replace(/@@/g, "@"); // Fix double @
        correctedEmail = correctedEmail.replace(
          /@uwa\.edu\.au@uwa\.edu\.au$/,
          "@uwa.edu.au"
        ); // Correct specific duplication

        return correctedEmail;
      });

      const correctedEmails = cleanedEmails.map((email) => {
        // First, ensure only one correct domain "@uwa.edu.au" exists
        // Remove any occurrences of "@uwa.ed.au"
        let fixedEmail = email.replace(/@uwa\.ed\.au/g, "");

        // Now handle the case where there might be a correct domain followed by an incorrect one
        // This regex finds "@uwa.edu.au" followed by any repetition and replaces it with a single instance
        fixedEmail = fixedEmail.replace(/(@uwa\.edu\.au)+/g, "@uwa.edu.au");

        return fixedEmail;
      });

      for (const email of correctedEmails) {
        try {
          await insertEmail(db, email);
        } catch (error) {
          console.error(`Error inserting email ${email}: `, error);
        }
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
