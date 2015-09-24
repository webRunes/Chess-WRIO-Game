var Titter = new(require('./app.js'))();
var nconf = require('./wrio_nconf.js');
var express = require('express');
var app = express();
var db = require('./utils/db.js');
var DOMAIN = nconf.get('server:workdomain');

var session = require('express-session');
var cookieParser = require('cookie-parser');
var cookie_secret = nconf.get("server:cookiesecret");

app.use('/', express.static(__dirname + '/index.htm'));

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

				app.set('views', __dirname + '/views');
				app.set('view engine', 'ejs');
				var SessionStore = require('connect-mongo')(session);
				app.use(cookieParser(cookie_secret));
				var sessionStore = new SessionStore({
					db: db
				});
				app.use(session({

					secret: cookie_secret,
					saveUninitialized: true,
					store: sessionStore,
					resave: true,
					cookie: {
						secure: false,
						domain: DOMAIN,
						maxAge: 1000 * 60 * 60 * 24 * 30
					},
					key: 'sid'
				}));

				app.get('/', function(request, response) {
					var command = '';
					for (var i in request.query) {
						if (command === '') {
							command = i;
						}
					}
					switch (command) {
						case 'start':
							{
								response.render('start.ejs', {
									"requestToken": request.query[command]
								});
								break;
							}
						default:
							{
								response.sendFile(__dirname + '/index.htm');
							}
					}
				})
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
						}, 1 * 10 * 1000);
					}
				})
			});
	})
	.catch(function(err) {
		console.log('Error connect to database:' + err.code + ': ' + err.message);
	});
