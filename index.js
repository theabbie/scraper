const express = require('express');
const app = express();
const req = require('request');
const rp = require('request-promise');
app.set('json spaces', 2);
const chrome = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const $ = require("cheerio");
    
app.get('/', async function(req, res) {
res.setHeader("Access-Control-Allow-Origin", "*");
try {
        var pad = req.query.pad || "@$";
        res.setHeader("Access-Control-Allow-Origin","*");
        if (req.query.static!="true") {
    const browser = await puppeteer.launch({
        args: chrome.args,
        executablePath: await chrome.executablePath,
        headless: chrome.headless,
    });
  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (Linux; Android 9; Redmi Note 7 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Mobile Safari/537.36");
    await page.setViewport({width: 1366, height: 654});
    await page.goto(req.query.url);
    await page.waitFor(parseInt(req.query.t) || 4000);
    if (req.query.ss=="true") {res.type("image/png").end(await page.screenshot({fullPage: true}))}
    var code = await page.evaluate(function() {return document.querySelector("html").outerHTML})
    if (req.query.var) {var varr = req.query.varr;code = await page.evaluate(function(varr) {'return '+varr},varr)}
    if (req.query.raw=="true") {res.type("application/json").end(code);}
    if (req.query.new=="true") {res.end(page.url());}
    else {
    var result = []
    var patt = new RegExp(req.query.patt || ".*","i");
    $(req.query.sel,code).each(function(i,elem) {
    if(patt.test($(this).attr(req.query.attribs))) {
    result.push({"attrib": $(this).attr(req.query.attribs), "text": $(this).text()})
    }
    })
    if (!req.query.join) {res.json(result)} else {res.type("html").end(`<meta name="viewport" content="width=device-width, initial-scale=1"><style>@font-face {font-family: kirvy; src: url('https://cdn.jsdelivr.net/gh/theabbie/theabbie.github.io/files/kirvy.otf');} * {font-family: kirvy; letter-spacing: 3px; word-spacing: 6px; line-height: 125%; font-weight: 900;}</style>`+result.map(x => pad.split("@").join(x.text).split("$").join(x.attrib)).join(req.query.join))}
   }
}
else {
    var options = {
    url: req.query.url,
    headers: {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 9; Redmi Note 7 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Mobile Safari/537.36'
      }
    };
    rp(options).then(function(code){
    res.setHeader("Access-Control-Allow-Origin", "*");
    if (req.query.raw=="true") {res.type("application/json").end(code);}
    else {
    var result = []
    var patt = new RegExp(req.query.patt || ".*","i");
    $(req.query.sel,code).each(function(i,elem) {
    if(patt.test($(this).attr(req.query.attribs))) {
    result.push({"attrib": $(this).attr(req.query.attribs), "text": $(this).text()})
    }
    })
    if (!req.query.join) {res.json(result)} else {res.type("html").end(`<meta name="viewport" content="width=device-width, initial-scale=1"><style>@font-face {font-family: kirvy; src: url('https://cdn.jsdelivr.net/gh/theabbie/theabbie.github.io/files/kirvy.otf');} * {font-family: kirvy; letter-spacing: 3px; word-spacing: 6px; line-height: 125%; font-weight: 900;}</style>`+result.map(x => pad.split("@").join(x.text).split("$").join(x.attrib)).join(req.query.join))}      
   }
}).catch(function(xcode) {
res.setHeader("Access-Control-Allow-Origin", "*");
    var result = []
    var patt = new RegExp(req.query.patt || ".*","i");
    $(req.query.sel,xcode).each(function(i,elem) {
    if(patt.test($(this).attr(req.query.attribs))) {
    result.push({"attrib": $(this).attr(req.query.attribs), "text": $(this).text()})
    }
})
if (!req.query.join) {res.json(result)} else {res.type("html").end(`<meta name="viewport" content="width=device-width, initial-scale=1"><style>@font-face {font-family: kirvy; src: url('https://cdn.jsdelivr.net/gh/theabbie/theabbie.github.io/files/kirvy.otf');} * {font-family: kirvy; letter-spacing: 3px; word-spacing: 6px; line-height: 125%; font-weight: 900;}</style>`+result.map(x => pad.split("@").join(x.text).split("$").join(x.attrib)).join(req.query.join))}
})
   }
    }
    catch (error) {
        res.end(error.message)
    }
})

app.listen(process.env.port)
