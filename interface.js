

exports.findOne = function(collection, query, callback) {
    collection.findOne(query, function(err, response) {
        if (err) {
            console.error(err);
        }
        callback(null, response);
    });
};


dbInterface.findOne(ShortUrl, { _id: shorturl }, function(err, response) {
    if (err) {
        console.error('There was an error searching the database');
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
