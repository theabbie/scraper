

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
    await page.waitFor(5500)
    var code = await page.evaluate(function() {return document.querySelector("html").outerHTML})
    var tp = req.query.var || "";
    var variable = await page.evaluate(function(tp) {return eval(tp)},tp)
    var rslt = $(req.query.sel,code)
    res.setHeader("Access-Control-Allow-Origin", "*");
    var result = []
    var x;
    var patt = new RegExp(req.query.patt || ".*","i");
    for (x in rslt) {
      if (rslt[x].attribs && patt.test(rslt[x].attribs[req.query.attribs])) {
  result.push(rslt[x].attribs[req.query.attribs])
      }
    }
    result.push(rslt.html())
    res.json(result)
        }
        else {
            rp(req.query.url).then(function(code){
              var rslt = $(req.query.sel,code)
    res.setHeader("Access-Control-Allow-Origin", "*");
    var result = []
    var x;
    var patt = new RegExp(req.query.patt || ".*","i");
    for (x in rslt) {
      if (rslt[x].attribs && patt.test(rslt[x].attribs[req.query.attribs])) {
  result.push(rslt[x].attribs[req.query.attribs])
      }
    }
    result.push(rslt.html())
    result.push(variable)
    res.json(result)  
            })
        }
    }
    catch (error) {
        res.end(error.message)
    }
})

app.listen(process.env.port)
