var Titter = new(require('./app.js'))();
var nconf = require('./wrio_nconf.js');
var express = require('express');
var app = express();
var db = require('./utils/db.js');

var session = require('express-session');
var cookieParser = require('cookie-parser');
var cookie_secret = nconf.get("server:cookiesecret");

app.use(cookieParser(cookie_secret));
app.use(session({
	secret: cookie_secret,
	saveUninitialized: true,
	resave: false
}));

var mongoUrl = 'mongodb://' + nconf.get('mongo:user') + ':' + nconf.get('mongo:password') + '@' + nconf.get('mongo:host') + '/' + nconf.get('mongo:dbname');
db.mongo({
		url: mongoUrl
	})
	.then(function(res) {
		console.log("Connected correctly to database");
		var db = res.db || {};
		var server = require('http')
			.createServer(app)
			.listen(nconf.get("server:port"), function(req, res) {
				console.log('app listening on port ' + nconf.get('server:port') + '...');
				app.use('/api/', (require('./persistent/route.js'))({
					db: db
				}));
				console.log("Application Started!");
				Titter.init({
					db: db
				}, function(err) {
					if (err) {
						console.log(err);
					} else {
						setInterval(function() {
							Titter.searchAndReply();
						}, 10000);
					}
				})
			});
	})
	.catch(function(err) {
		console.log('Error connect to database:' + err.code + ': ' + err.message);
	});
