import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );

  // Navigate to the main page
  await page.goto(
    "https://www.aut.ac.nz/study/study-options/engineering-computer-and-mathematical-sciences/academic-staff"
  );

  // Extract the URLs of each staff member
  const staffUrls = await page.$$eval(
    "#content_container_257037 p a",
    (links) => links.map((link) => link.href)
  );

  console.log(staffUrls);

  await page.goto(staffUrls[0], { waitUntil: "networkidle0" });

  // Click the button to show the email address
  await page.click('button[data-qa="emailModalButton"]');

  // Selecting the email
  await page.waitForSelector('div span a[href^="mailto:"');

  // Select the anchor tag
  const emailAnchor = await page.$('div span a[href^="mailto:"]');

  // Collectin the email
  const email = await page.evaluate(
    (el: HTMLAnchorElement) => el.textContent,
    emailAnchor
  );

  console.log(email);

  await browser.close();
})();
