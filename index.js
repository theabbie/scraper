const express = require('express')
const app = express()
const req = require('request');
const rp = require('request-promise');
app.set('json spaces', 2)
const chrome = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const $ = require("cheerio");
    
app.get('/', async function(req, res) {
    try {
        if (req.query.static!="true") {
    const browser = await puppeteer.launch({
        args: chrome.args,
        executablePath: await chrome.executablePath,
        headless: chrome.headless,
    });
  const page = await browser.newPage();
  await page.setUserAgent(req.headers["user-agent"]);
    await page.setViewport({width: 1366, height: 654});
    await page.goto(req.query.url);
    await page.waitFor(4000)
    var code = await page.evaluate(function() {return document.querySelector("html").outerHTML})
    res.setHeader("Access-Control-Allow-Origin", "*");
    var result = []
    var patt = new RegExp(req.query.patt || ".*","i");
    $(req.query.sel,code).each(function(i,elem) {
    if(patt.test($(this).attr(req.query.attribs))) {
    result.push({"attrib": $(this).attr(req.query.attribs), "text": $(this).text()})
    }
    })
    res.json(result)
}
else {
    rp(req.query.url).then(function(code){
    res.setHeader("Access-Control-Allow-Origin", "*");
    var result = []
    var patt = new RegExp(req.query.patt || ".*","i");
    $(req.query.sel,code).each(function(i,elem) {
    if(patt.test($(this).attr(req.query.attribs))) {
    result.push({"attrib": $(this).attr(req.query.attribs), "text": $(this).text()})
    }
    })
    res.json(result)  
            })
        }
    }
    catch (error) {
        res.end(error.message)
    }
})

app.listen(process.env.port)
