import puppeteer, { Browser } from "puppeteer";

export const startPupeeteer = async () => {
  let browser = await puppeteer.launch({ headless: "new" });

  return browser;
};
