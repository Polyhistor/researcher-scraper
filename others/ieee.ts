const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // Non-headless mode can be useful for debugging
    args: ["--start-maximized"], // Start maximized
  });
  const page = await browser.newPage();

  // Set a common user-agent
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  );

  const urlPart1 =
    "https://ieeexplore.ieee.org/search/searchresult.jsp?action=search&matchBoolean=true&queryText=(%22All%20Metadata%22:impact%20of%20big%20data%20analytics)%20OR%20(%22All%20Metadata%22:Data%20Science)%20AND%20(%22All%20Metadata%22:Organizational%20Efficiency)%20OR%20(%22All%20Metadata%22:Organizational%20Growth)%20OR%20(%22All%20Metadata%22:Firm%20Efficiency)%20AND%20(%22All%20Metadata%22:Firm%20Growth)&highlight=true&returnType=SEARCH&matchPubs=true&rowsPerPage=100";

  const urlPart2 =
    "&refinements=ContentType:Conferences&refinements=ContentType:Journals&refinements=ContentType:Books&refinements=ContentType:Magazines&refinements=ContentType:Early%20Access%20Articles&ranges=2014_2024_Year&returnFacets=ALL";

  for (let i = 1; i <= 10; i++) {
    try {
      const url = `${urlPart1}&pageNumber=${i}${urlPart2}`;
      await page.goto(url, { waitUntil: "networkidle2" });
      await page.goto(url, { waitUntil: "networkidle2" });

      // Wait for the 'Export' button to appear and check if it exists
      if ((await page.$("button.xpl-toggle-btn")) !== null) {
        await page.click("button.xpl-toggle-btn");

        // Wait for popup and interact with elements
        await page.waitForSelector('input[name="download-format"]');
        await page.click('input[name="download-format"]'); // Choose BibTeX format

        await page.waitForSelector('input[name="citations-format"]');
        await page.click('input[name="citations-format"]'); // Choose 'Citation and Abstract'

        await page.waitForSelector(
          "button.stats-SearchResults_Citation_Download"
        );
        await page.click("button.stats-SearchResults_Citation_Download"); // Click on 'Download'

        // Implement logic to handle the download
      } else {
        console.log(`'Export' button not found on page ${i}`);
      }
    } catch (error) {
      console.error(`Error on page ${i}:`, error.message);
    }

    // Wait for a while before moving to the next page
    await page.waitForTimeout(10000); // Wait for 10 seconds
  }

  await browser.close();
})();
