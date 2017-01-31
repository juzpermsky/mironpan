let request = require('request');
let cheerio = require('cheerio');

const $ = cheerio;
//let $ = cheerio.load('<h2 class="title">Hello world</h2>')

// $('h2.title').text('Hello there!')
// $('h2').addClass('welcome')
//
// $.html()


//for (let i = 1; i <= 16; i++) {
//for (let i = 1; i <= 1; i++)

let hrefs = [];

let getHrefsRecursive = (i)=> {
    let j = request.jar();
    let cookie = request.cookie('PHPSESSID=b96ddf606f18a8d9725f182c341d2be1');

    let url = `http://mironpan.com/handbags/tote?page=${i}`;
    j.setCookie(cookie, url);
    request({url: url, jar: j}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            let htmlDoc = $(body);
            htmlDoc.find("a.img").each(function (index, element) {
                hrefs.push($(element).attr("href"));
            });
            if (i < 16) {
                console.log(hrefs.length);
                getHrefsRecursive(i + 1);
            } else {
                console.log(hrefs);
            }

            // Show the HTML for the Google homepage.
        }
    });
};

getHrefsRecursive(1);
