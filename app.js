const puppeteer = require('puppeteer');
const $ = require('cheerio');
const CronJob = require('cron').CronJob;
const nodemailer = require('nodemailer');
const config = require('./config');

const url = 'https://www.amazon.in/JBL-Portable-Wireless-Powerful-Black/dp/B01MSYQWNY/';

async function configureBrowser(){
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url,{
    waitUntil:'load',
    timeout:0
  });
  return page;
}

async function checkPrice(page){

  await page.reload();
  let html = await page.evaluate(() => document.body.innerHTML);

  $('#priceblock_ourprice',html).each(function(){
    let price = $(this).text();
    let currentPrice = Number(price.replace(/[^0-9.-]+/g,""));
    // console.log(currentPrice);

    if(currentPrice < 7000){
      console.log("Buyy :" + currentPrice);
      sendNotfication(currentPrice);
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

async function sendNotfication(price){
  var transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
      user:config.email,
      pass:config.pass
    }
  });

  let textToSend = "Price Dropped to" + price;
  let htmlText = `<a href=\"${url}\">Link</a>`;

  let info = await transporter.sendMail({
    from: '"Price Tracker" <photos.rssut@gmail.com>',
    to:'umang.usict.042164@ipu.ac.in',
    subject:"Price Dropped to" + price,
    text:textToSend,
    html:htmlText
  });

  console.log("Message Sent: %s",info.messageId);
}

startTracking();

// async function monitor(){
//   let page = await configureBrowser();
//   await checkPrice(page);
// }

// monitor();