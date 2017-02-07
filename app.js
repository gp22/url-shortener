/*
URL Shortener
The URL shortener microservice performs a very simple function when it is
passed a URL (example: `https://www.google.com`) as a parameter:
It will generate a shortened version of the URL in JSON format
(example: `https://gp22-shorturl.herokuapp.com/1000`).
When you enter the short version of the URL into your web browsers address
bar it will redirect you to your original URL.
If you enter either an invalid URL or an invalid short URL it will respond
with an error in JSON format.
One thing about this app that I think is really funny is that the short URLs
it generates for you are often longer than the actual URL! But it was a fun
app to build either way!
Example to create a new short URL
https://gp22-shorturl.herokuapp.com/new/https://www.google.com
Example response
{ "original_url": "https://www.google.com",
"short_url": "https://gp22-shorturl.herokuapp.com/1000" }
Example usage
https://gp22-shorturl.herokuapp.com/1000
Redirects to
https://www.google.com
*/
'use strict';

var express = require('express');
var app = express();
var validUrl = require('valid-url');
var mongoose = require('mongoose');

/*
Use the heroku environment variable MLAB_URI to store the db name and login
Set the variable with the command 'heroku config:set MLAB_URI='
*/
const uri = process.env.MLAB_URI;

// Uncomment this line to verify MLAB_URI in case of connection problems
// console.log('uri:', process.env.MLAB_URI);

// This is the URL that will be used to create the short url JSON responses
// Comment it out when using the following const values for local testing
const APPURL = 'https://gp22-shorturl.herokuapp.com/';

// Use these values for local testing
// const HOSTNAME = 'localhost';
// const PORT = 3000;
// const DBNAME = 'shorturls';
// const uri = 'mongodb://' + HOSTNAME + '/' + DBNAME;
// const APPURL = HOSTNAME + ':' + PORT + '/';

mongoose.connect(uri);

app.use(express.static('public'));
app.set('view engine', 'ejs');

// Define schemas for the format of the db records
var shortUrlSchema = new mongoose.Schema({
    _id: Number,
    original_url: String
});

var counterSchema = new mongoose.Schema({
    sequenceValue: Number
});

var Counter = mongoose.model('Counter', counterSchema);
var ShortUrl = mongoose.model('ShortUrl', shortUrlSchema);

app.get('/', function(req, res) {
    res.render('home');
});

app.get('/new/*', function(req, res) {
    /*
    This route is used to generate a new short url
    First it checks to make sure the provided URL is formatted correctly
    Then it checks to see if the provided URL exists in the db
    If it does, it uses the record associated with that URL to create a response
    It it doesn't, it adds the URL to the db and uses the newly created entry
    to create the response
    It sends all responses in JSON
    */
    var response = {};
    var url = req.params[0];

    if (!validUrl.isWebUri(url)) {
        // provided url is invalid
        response["error"] =
            'Invalid URL: Use the format http(s)://www.example.com';
        res.send(response);
        return;
    }

    // check if url exists in db
    ShortUrl.findOne({ original_url: url }, function(err, shorturl) {
        if (err) {
            console.error(err);
        } else if (shorturl !== null) {
            // url exists in db, use it to create response
            response["original_url"] = shorturl.original_url;
            var shorturlString = shorturl._id.toString();
            response["short_url"] = APPURL + shorturlString;

            res.send(response);
        } else {
            // url not in db, create it using the next Counter value
            Counter.findOneAndUpdate({}, { $inc: { sequenceValue: 1 } },
                function(err, result) {
                    if (err) {
                        console.error(err);
                    } else {
                        ShortUrl.create({
                            _id: result.sequenceValue,
                            original_url: url
                        }, function(err, shortUrl) {
                            if (err) {
                                console.error(err);
                            } else {
                                // short url successfully created
                                // use it to create response
                                response["original_url"] = shortUrl.original_url;
                                var shorturlString = shortUrl._id.toString();
                                response["short_url"] = APPURL + shorturlString;

                                res.send(response);
                            }
                        });
                    }
                });
        }
    });
});

app.get('/:shorturl', function(req, res) {
    /*
    This route is used to redirect to the shortened url
    First it makes sure the provided parameter is actually a number
    Then it searches the db for the given number
    If it finds the number in the db, it redirects to the URL associated
    with that number
    If not, it sends and error response in JSON
    */

    var shorturl = req.params.shorturl;
    var response = {};

    if (!Number(shorturl)) {
        response["error"] = 'URL not in database';
        res.send(response);
        return;
    }

    ShortUrl.findOne({ _id: shorturl }, function(err, result) {
        if (err) {
            console.error(err);
        } else if (result !== null) {
            // shorturl exists in db, redirect to it
            var redirect = result.original_url;
            res.redirect(redirect);
        } else {
            // shorturl not in db, send error response
            response["error"] = 'URL not in database';
            res.send(response);
        }
    });
});

// use process.env.PORT for compatibility with heroku
app.listen(process.env.PORT || 3000, function() {
    console.log('Server started');
});
