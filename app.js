var express = require('express');
var app = express();
var validUrl = require('valid-url');
var mongoose = require('mongoose');

const HOSTNAME = 'localhost';
const PORT = 3000;
const DBNAME = 'shorturls';
const uri = 'mongodb://' + HOSTNAME + '/' + DBNAME;
const APPURL = HOSTNAME + ':' + PORT;

mongoose.connect(uri);

app.set('view engine', 'ejs');

// to be removed VERY SOON!
var urls = {};
var shortUrls = {};
var count = 1;

var shortUrlSchema = new mongoose.Schema({
    original_url: String,
    short_url: Number
});

var ShortUrl = mongoose.model('ShortUrl', shortUrlSchema);

// ShortUrl.create({
//     original_url: 'https://www.github.com',
//     short_url: 3
// }, function(err, shortUrl) {
//     if(err) {
//         console.error('ERROR');
//     } else {
//         console.log('Short URL created');
//         console.log(shortUrl);
//     }
// });

app.get('/', function(req, res) {
    res.render('home');
});

app.get('/new/*', function(req, res) {
    /*
    route used to generate a new short url
    creates and sends the response in JSON
    uses the getShortUrl function to interface with the db
    */
    var response = {};
    var url = req.params[0];

    if (validUrl.isUri(url)) {
        var shortUrl = APPURL + getShortUrl(url);
        response["original_url"] = url;
        response["short_url"] = shortUrl;
        res.send(response);
    } else {
        response["error"] = 'Invalid URL: Make sure your URL follows the format http(s)://www.example.com';
        res.send(response);
    }
});

app.get('/:shorturl', function(req, res) {
    // route used to redirect to shortened url
    var shorturl = req.params.shorturl;

    if (shortUrls.hasOwnProperty(shorturl)) {
        var redirectUrl = shortUrls[shorturl];
        // console.log('shortUrls has property');
        res.redirect(redirectUrl);
    } else {
        var response = {};
        response["error"] = 'URL not in database';
        res.send(response);
    }
});

// use process.env.PORT for compatibility with heroku
app.listen(process.env.PORT || 3000, function() {
    console.log('Server started');
});

function getShortUrl(url) {
    /*
    gets number value of url used for creating shortened url
    adds key value pairs for urls/number values to db

    arguments - valid url (string)
    returns - number parameter for short url (string)
    */

    // if (urls.hasOwnProperty(url)) {
    //     return urls[url];
    // } else {
    //     var nextValue = count.toString();
    //     urls[url] = nextValue;
    //     shortUrls[nextValue] = url;
    //     count++;
    //     return urls[url];
    // }

    ShortUrl.findOne({original_url: url}, function(err, shorturl) {
        if (err) {
            console.error(err);
        } else if (shorturl !== null) {
            console.log(shorturl);
        } else {
            console.log(url, 'not in db');
        }
    });
};
