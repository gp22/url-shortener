var express = require('express');
var app = express();
var validUrl = require('valid-url');
var mongoose = require('mongoose');

const uri = process.env.MLAB_URI;
const APPURL = 'https://gp22-shorturl.herokuapp.com/';

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
                                response["short_url"] = APPURL + shorturlString;;

                                res.send(response);
                            }
                        });
                    }
                });
        }
    });
});

app.get('/:shorturl', function(req, res) {
    // route used to redirect to shortened url
    var shorturl = req.params.shorturl;

    ShortUrl.findOne({ _id: shorturl }, function(err, response) {
        if (err) {
            console.error(err);
        } else if (response !== null) {
            // shorturl exists in db, redirect to it
            var redirect = response.original_url;
            res.redirect(redirect);
        } else {
            // shorturl not in db, send error response
            var response = {};
            response["error"] = 'URL not in database';
            res.send(response);
        }
    });
});

// use process.env.PORT for compatibility with heroku
app.listen(process.env.PORT || 3000, function() {
    console.log('Server started');
});
