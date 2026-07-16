const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  // Assuming the dev server or preview server is running on localhost:4173
  await page.goto('http://localhost:4173');
  
  // Wait for the Play button and click it
  try {
    await page.waitForSelector('a[href="/alphabet"]', { timeout: 5000 });
    await page.click('a[href="/alphabet"]');
    // Wait a bit to catch the error
    await new Promise(resolve => setTimeout(resolve, 2000));
  } catch (err) {
    console.log('Error interacting:', err);
  }
  
  await browser.close();
})();
