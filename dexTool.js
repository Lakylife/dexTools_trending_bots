/**
 * This code is the intellectual property of Tvujpartak.cz and is protected by copyright.
 *
 * 
 *
 *        ______            __       __        __
 *       / ____/____   ____/ /___   / /____ _ / /__ __  __
 *      / /    / __ \ / __  // _ \ / // __ `// //_// / / /
 *     / /___ / /_/ // /_/ //  __// // /_/ // ,<  / /_/ /
 *     \____/ \____/ \__,_/ \___//_/ \__,_//_/|_| \__, /
 *                                               /____/
 *
 * © Tvujpartak.cz, 2023 Licence
 * All rights reserved.
 * Autor: Lukas Helebrandt
 * Datum: 12. června 2023
 * Licence: MIT
 * Contakt: lukas.helebrandt@gmail.com
 * 
*/

const puppeteer = require('puppeteer');
const request = require('request-promise');
const fs = require('fs');

const PROCESS_COUNT = 1;
const THREAD_COUNT = 1000; // Number of simulations at one moment
const RESTART_INTERVAL = 10000; // 10 seconds
const IP_INTERVAL = 30000; // 30 seconds
const DELAY_BEFORE_CLICK = 3000; // 3 milliseconds
const DELAY_BETWEEN_THREADS = 10000; // 10 seconds (The difference between simulations)

const PUMBO_URL = 'link_ONE_OPEN_PAGE';
const DEXTOOLS_URL = 'https://www.dextools.io/';
const LINKS = [
  'link Etherscan/bnb',
];

const commands = [
  accessPumboAndDextoolsInThreads,
];

let proxyIndex = 0;

function* cyclicGenerator(array) {
  let index = 0;
  while (true) {
    yield array[index];
    index = (index + 1) % array.length;
  }
}

process.setMaxListeners(30);
async function accessPumboAndDextools() {
  // Load proxy addresses from file
  const proxies = fs.readFileSync('proxy.txt', 'utf8').split('\n').filter(Boolean);

  // Get proxy address
  const proxy = proxies[proxyIndex];
  const [ip, port, username, password] = proxy.split(':');

  // Increase index for the next proxy address (if index exceeds the length of the array, it will return to the beginning)
  proxyIndex = (proxyIndex + 1) % proxies.length;

  const browser = await puppeteer.launch({
    headless: false, // Display Chrome browser
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', //Where your GOOGLE CHROMEDRIVER is located
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-software-rasterizer',
      '--disable-extensions',
      '--mute-audio',
      '--disable-application-cache',
      '--media-cache-size=1',
      '--aggressive-cache-discard',
      '--window-size=800,600', // Set the window size to 800x600
     // '--disable-infobars',
     // '--disable-notifications',
      '--disable-offline-auto-reload',
      '--disable-offline-auto-reload-visible-only',
      '--blink-settings=imagesEnabled=false',
      '--disable-image-loading',
      `--proxy-server=${ip}:${port}`,
    ],
  });

  const page = await browser.newPage();

  try {
    // Authenticate for the proxy server
    await page.authenticate({
      username: username,
      password: password,
    });

    await page.goto(PUMBO_URL);
    console.log('Launching One Page');

    // Start timer
    await page.evaluate(() => {
      console.time('One Page Time');
    });

    // Custom code for Pumbo Space

    // End timer for Pumbo Space
    await page.evaluate(() => {
      console.timeEnd('One Page Time');
    });

    await page.goto(DEXTOOLS_URL);
    console.log('Launching DEXTOOLS Web');

    // Start timer for DEXTOOLS
    await page.evaluate(() => {
      console.time('DEXTOOLS Time');
    });

    await page.waitForTimeout(DELAY_BEFORE_CLICK);
    await page.waitForSelector('.close');
    await page.click('.close');
    console.log('Closing ad banner');

    await page.waitForTimeout(DELAY_BEFORE_CLICK);
    await page.waitForSelector('.search-mobile-button');
    await page.click('.search-mobile-button');
    console.log('Clicking on search button');

    await page.waitForTimeout(DELAY_BEFORE_CLICK);
    await page.waitForSelector('.search-pairs');
    await page.type('.search-pairs', 'Oxf'); // Enter what will be searched here
    console.log('Entering ERC20 address and searching');

    await page.waitForTimeout(DELAY_BEFORE_CLICK);
    await page.waitForSelector('.auto-complete-text');
    await page.click('.auto-complete-text');

    await page.waitForTimeout(DELAY_BEFORE_CLICK);
    await page.waitForSelector('app-favorite-button');
    await page.click('app-favorite-button');
    console.log('Clicking on favorite button');

    await page.waitForTimeout(DELAY_BEFORE_CLICK);
    await page.waitForSelector('.fa-share');
    await page.click('.fa-share');
    console.log('Clicking on share');

    await page.waitForTimeout(DELAY_BEFORE_CLICK);
    await page.waitForSelector('button.btn.btn-primary.btn-swap-1');
    await page.click('button.btn.btn-primary.btn-swap-1');
    console.log('Copying...');

    await page.waitForTimeout(DELAY_BEFORE_CLICK);
    await page.waitForSelector('.close.ng-star-inserted');
    await page.click('.close.ng-star-inserted');
    console.log('Exiting share');

    for (const link of LINKS) {
      await page.waitForTimeout(DELAY_BEFORE_CLICK);
      await page.goto(link);
    }
    console.log('Opening ETHERSCAN WEB');

    // Stop the timer in the browser console
    await page.evaluate(() => {
      console.timeEnd('DEXTOOLS Time');
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the browser at the end of each cycle
    await browser.close();

    // No need to reopen the browser in this case
    console.log('Closing Browsers and repeating the function...');
  }
}

async function accessPumboAndDextoolsInThreads() {
  const promises = [];
  for (let i = 0; i < THREAD_COUNT; i++) {
    promises.push(accessPumboAndDextools());
    await delay(DELAY_BETWEEN_THREADS); // Add delay between threads
  }
  await Promise.all(promises);
}

async function executeCommands() {
  for (const command of commands) {
    await command();
  }
}

async function main() {
  while (true) {
    await executeCommands();

    await delay(RESTART_INTERVAL);

    // Reset the commands array for repeating the commands
    commands.length = 0;
    commands.push(accessPumboAndDextoolsInThreads);
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((err) => console.error(err));