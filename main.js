let request = require('request');
let cheerio = require('cheerio');
let urls = require("./tote");
let csvWriter = require('csv-write-stream')
var fs = require("fs");
let writer = csvWriter();


const $ = cheerio;
//let $ = cheerio.load('<h2 class="title">Hello world</h2>')

// $('h2.title').text('Hello there!')
// $('h2').addClass('welcome')
//
// $.html()


//for (let i = 1; i <= 16; i++) {
//for (let i = 1; i <= 1; i++)

let hrefs = [];

let getProductRecursive = (i)=> {
    let j = request.jar();
    let cookie = request.cookie('PHPSESSID=b96ddf606f18a8d9725f182c341d2be1');
    let url = urls[i];
    j.setCookie(cookie, url);
    request({url: url, jar: j}, function (error, response, body) {
        let product = {};
        product.url = url;
        if (!error && response.statusCode == 200) {
            //console.log(body);

            let htmlDoc = $(body);
            product.title = htmlDoc.find("title").text();
            //console.log("title", htmlDoc.find("title").text());
            product.price = htmlDoc.find("meta[itemprop=price]").attr("content").trim();
            //console.log("price", htmlDoc.find("meta[itemprop=price]").attr("content"));
            product.shortDescription = htmlDoc.find("meta[name=description]").attr("content").trim();
            //console.log("description", htmlDoc.find("meta[name=description]").attr("content"));
            htmlDoc.find("div.description").find("p").each((index, elem)=> {
                let str = $(elem).text().trim();
                if (str.indexOf("Модель:") >= 0) {
                    product.model = str.replace("Модель:", "").trim();
                    //console.log("model", str.replace("Модель:", "").trim());
                } else if (str.indexOf("Наличие:") >= 0) {
                    product.exists = str.replace("Наличие:", "").trim();
                    //console.log("exists", str.replace("Наличие:", "").trim());
                }
            });
            let imgs = [];
            htmlDoc.find("#image-additional-carousel a").each((i, e)=> {
                imgs.push($(e).attr("href"));
            });

            imgs = imgs.filter((elem, pos)=>imgs.indexOf(elem) == pos);
            product.imgs = imgs.join("\n");
            //console.log("imgs", imgs);
            product.tabDescription = htmlDoc.find("#tab-description").text().trim();
            //console.log("tab-description", htmlDoc.find("#tab-description").text().trim());
            let str = "";
            htmlDoc.find("#tab-attribute table tr").each((i, e)=> {
                $(e).find("td").each((i, e)=> {
                    if (i == 0) {
                        str += $(e).text() + ": ";
                    } else {
                        str += $(e).text()+"\n";
                    }
                });
            });
            product.attributes = str;
            //console.log(str);
            if (i < 5) {
                writer.write(product);
                getProductRecursive(i + 1);
            }else{
                writer.end();
            }


            //.each(function (index, element) {
            //     hrefs.push($(element).attr("href"));
            // });
            // if (i < 5) {
            //     console.log(hrefs.length);
            //     getHrefsRecursive(i + 1);
            // } else {
            //     console.log(JSON.stringify(hrefs));
            // }
            //
            // // Show the HTML for the Google homepage.
        }
    });

};

let getHrefsRecursive = (i)=> {
    let j = request.jar();
    let cookie = request.cookie('PHPSESSID=b96ddf606f18a8d9725f182c341d2be1');

    //let url = `http://mironpan.com/handbags/tote?page=${i}`;
    //let url = `http://mironpan.com/handbags/shoulder-bags?page=${i}`;
    //let url = `http://mironpan.com/handbags/backpacks-and-luggage?page=${i}`;
    let url = `http://mironpan.com/handbags/clutches?page=${i}`;

    j.setCookie(cookie, url);
    request({url: url, jar: j}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            let htmlDoc = $(body);
            htmlDoc.find("a.img").each(function (index, element) {
                hrefs.push($(element).attr("href"));
            });
            if (i < 5) {
                console.log(hrefs.length);
                getHrefsRecursive(i + 1);
            } else {
                console.log(JSON.stringify(hrefs));
            }

            // Show the HTML for the Google homepage.
        }
    });
};

//getHrefsRecursive(1);
writer.pipe(fs.createWriteStream('tote.csv'))
getProductRecursive(0);

