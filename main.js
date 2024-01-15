import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate to the main page
  await page.goto(
    "https://www.aut.ac.nz/study/study-options/engineering-computer-and-mathematical-sciences/academic-staff"
  );

  // Extract the URLs of each staff member
  const staffUrls = await page.$$eval(
    "#content_container_257037 p a",
    (links) => links.map((link) => link.href)
  );

  // Loop through each URL
  for (const url of staffUrls) {
    await page.goto(url);

    // Replace 'selector-for-email' with the actual selector for the email element
    const email = await page.$eval(
      'ul[role="list"] li[role="listitem"] a[href^="mailto:"]',
      (element) => element.textContent.trim()
    );

    console.log(`Email: ${email}`);
  }

  await browser.close();
})();
