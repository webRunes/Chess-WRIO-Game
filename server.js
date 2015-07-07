var Titter = require('./titter');
var nconf = require('./wrio_nconf.js');
var MongoClient = require('mongodb')
	.MongoClient;
var express = require('express');
var app = express();

var server = require('http')
	.createServer(app)
	.listen(nconf.get("server:port"), function(req, res) {
		console.log('app listening on port ' + nconf.get('server:port') + '...');
		var url = 'mongodb://' + nconf.get('mongo:user') + ':' + nconf.get('mongo:password') + '@' + nconf.get('mongo:host') + '/' + nconf.get('mongo:dbname');
		MongoClient.connect(url, function(err, db) {
			if (err) {
				console.log("Error coonect to database: " + err);
			} else {
				console.log("Connected correctly to server");
				setInterval(function() {
					Titter.searchAndReply(db);
				}, 10000);
			}
		});
	});


var session = require('express-session');
var cookieParser = require('cookie-parser');
var cookie_secret = nconf.get("server:cookiesecret");

app.use(cookieParser(cookie_secret));
app.use(session({
	secret: cookie_secret,
	saveUninitialized: true,
	resave: false
}));
