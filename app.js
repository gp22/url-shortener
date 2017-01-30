var express = require('express');
var app = express();
var validUrl = require('valid-url');
var APPURL = 'localhost:3000/'

app.set('view engine', 'ejs');

var urls = {};
var shortUrls = {};
var count = 1;

app.get('/', function(req, res) {
    res.render('home');
});

app.get('/new/*', function(req, res) {
// route used to generate a new short url
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
        console.log('shortUrls has property');
    } else {
        console.log('shortUrls does not have property');
    }
});

// use process.env.PORT for compatibility with heroku
app.listen(process.env.PORT || 3000, function() {
    console.log('Server started');
});

function getShortUrl(url) {
/*
gets number value of url used for creating shortened url
adds key value pairs for urls/number values to urls and shortUrls objects

arguments - valid url (string)
returns - short url (string)
*/
  if (urls.hasOwnProperty(url)) {
    // console.log('urls has property')
    // console.log(urls);
    // console.log(shortUrls);
    return urls[url];
  } else {
    // console.log('urls does not have property')
    var nextValue = count.toString();
    urls[url] = nextValue;
    shortUrls[nextValue] = url;
    count++;
    // console.log(urls);
    // console.log(shortUrls);
    return urls[url];
  }
};