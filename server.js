const express = require('express');
const mongojs = require('mongojs');
const request = require('request');
const cheerio = require('cheerio');

const app = express();

const databaseUrl = 'scraper';
const collections = ['scrapedData'];

const db = mongojs(databaseUrl, collections);
db.on('err', (err) => {
    console.log('Database error', err);
})

app.get('/', (req,res) => {
    res.send('hello world')
});

app.get('/all', (req,res) => {
    db.scrapedData.find({}, (err, found) => {
        if (err) {
            console.log(err)
        } else {
            res.json(found);
        }
    })    
})

app.get('/scrape', function(req,res) {
    request('https://news.ycombinator.com/', function(error, response, html) {
        let $ = cheerio.load(html);

        $('.title').each(function(i,element) {
            let title = $(this).children('a').text();
            let link = $(this).children('a').attr('href');
            
            if(title && link) {
                db.scrapedData.save({
                    title:title,
                    link:link
                },
                function(error,saved) {
                    if (error) {
                        console.log(error)
                    } else {
                        console.log(saved,'succesfully saved')
                    }
                }
                )
            }
        })
    })

    res.send('scrape complete');
})




app.listen(3000, () => {
    console.log('app running on port 3000')
})

