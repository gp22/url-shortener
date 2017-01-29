var express = require('express');
var app = express();
var validUrl = require('valid-url');

app.set('view engine', 'ejs');

app.get('/', function(req, res) {
    res.render('home');
});

app.get('/new/*', function(req, res) {
    var url = req.params[0];

    if (validUrl.isUri(url)) {
        res.send(url + ' is a valid url!')
    } else {
        res.send(url + ' is not a valid url!');
    }
});

// use process.env.PORT for compatibility with heroku
app.listen(process.env.PORT || 3000, function() {
    console.log('Server started');
});
