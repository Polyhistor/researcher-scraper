import puppeteer, { Browser } from "puppeteer";

export const startPupeeteer = async () => {
  let browser;

  browser = await puppeteer.launch({ headless: "new" });

  return { browser };
};
