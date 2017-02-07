URL Shortener

The URL shortener microservice performs a very simple function when it is passed a URL (example: `https://www.google.com`) as a parameter:

It will generate a shortened version of the URL in JSON format (example: `https://gp22-shorturl.herokuapp.com/1000`).

When you enter the short version of the URL into your web browsers address bar it will redirect you to your original URL.

If you enter either an invalid URL or an invalid short URL it will respond with an error in JSON format.

One thing about this app that I think is really funny is that the short URLs it generates for you are often longer than the actual URL! But it was a fun app to build either way!

Example to create a new short URL

`https://gp22-shorturl.herokuapp.com/new/https://www.google.com`

Example response

`{ "original_url": "https://www.google.com", "short_url": "https://gp22-shorturl.herokuapp.com/1000" }`

Example usage

`https://gp22-shorturl.herokuapp.com/1000`

Redirects to

`https://www.google.com`