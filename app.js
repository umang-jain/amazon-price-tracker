const puppeteer = require('puppeteer');
const $ = require('cheerio');
const CronJob = require('cron').CronJob;
const nodemailer = require('nodemailer');

const url = 'https://www.amazon.in/JBL-Portable-Wireless-Powerful-Black/dp/B01MSYQWNY/';

async function configureBrowser(){
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  return page;
}

async function checkPrice(page){

  await page.reload();
  let html = await page.evaluate(() => document.body.innerHTML);
  // console.log(html);
  //#priceblock_ourprice

  $('#priceblock_ourprice',html).each(function(){
    let price = $(this).text();
    let currentPrice = Number(price.replace(/[^0-9.-]+/g,""));
    // console.log(currentPrice);

    if(currentPrice < 7000){
      console.log("Buyy :" + currentPrice);
    }
  })
}

async function startTracking(){
  const page = await configureBrowser();

  let job = new CronJob('*/15 * * * * *',function(){
    checkPrice(page);
  },null, true, null, null, true);

  job.start();
}

startTracking();

// async function monitor(){
//   let page = await configureBrowser();
//   await checkPrice(page);
// }

// monitor();