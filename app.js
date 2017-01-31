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
        response["error"] =
            'Invalid URL: Use the format http(s)://www.example.com';
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

    arguments: valid url (string)
    returns: number parameter for short url (string)
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

    ShortUrl.findOne({ original_url: url }, function(err, shorturl) {
        if (err) {
            console.error(err);
        } else if (shorturl !== null) {
            console.log(shorturl);
        } else {
            console.log(url, 'not in db');
        }
    });
};

function getNextCount() {
    /*
    arguments: none
    returns: next Counter value
    */
    // Counter.findOne({}, function(err, nextCount) {
    //     if (err) {
    //         console.error(err);
    //     } else {
    //         // increment the _id of Counter
    //         // return _id of Counter
    //         Counter.update({ $inc: { sequenceValue: 1 } }, function(err, result) {
    //             if (err) {
    //                 console.error(err);
    //             } else {
    //                 // console.log('Counter updated successfully');
    //                 // console.log(result);
    //             }
    //         });
    //         console.log('next counter value');
    //         console.log(nextCount.sequenceValue);
    //     }
    // });
};

Counter.findOneAndUpdate({}, { $inc: { sequenceValue: 1 } },
    function(err, result) {
        if (err) {
            console.error(err);
        } else {
            console.log(result.sequenceValue);
        }
    });

// ShortUrl.create({
//     _id: 1,
//     original_url: 'https://www.google.com'
// }, function(err, shortUrl) {
//     if(err) {
//         console.error('ERROR');
//     } else {
//         console.log('Short URL created');
//         console.log(shortUrl);
//     }
// });

// Counter.create({
//     _id: 2
// }, function(err, shortUrl) {
//     if(err) {
//         console.error('ERROR');
//     } else {
//         console.log('Counter created');
//         console.log(shortUrl);
//     }
// });
