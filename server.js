var Titter = new(require('./app.js'))();
var nconf = require('./wrio_nconf.js');
var express = require('express');
var app = express();
var db = require('./utils/db.js');
var DOMAIN = nconf.get('server:workdomain');

var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var cookie_secret = nconf.get("server:cookiesecret");
var wrioLogin;

app.use(function(request, response, next) {
	response.setHeader('Access-Control-Allow-Origin', 'http://wrioos.com');
	response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
	response.setHeader('Access-Control-Allow-Credentials', true);
	next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

var mongoUrl = 'mongodb://' + nconf.get('mongo:user') + ':' + nconf.get('mongo:password') + '@' + nconf.get('mongo:host') + '/' + nconf.get('mongo:dbname');
db.mongo({
		url: mongoUrl
	})
	.then(function(res) {
		console.log("Connected correctly to database");
		var db = res.db || {};
		wrioLogin = require('./wriologin')(db);
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
						//domain: DOMAIN,
						maxAge: 1000 * 60 * 60 * 24 * 30
					},
					key: 'sid'
				}));

				var p3p = require('p3p');
				app.use(p3p(p3p.recommended));
				app.use(express.static(__dirname + '/'));

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
								wrioLogin.loginWithSessionId(request.sessionID, function(err, res) {
									if (err) {
										console.log("User not found:",
											err);
										response.render('start.ejs', {
											"error": "Not logged in",
											"user": undefined,
											"invite": undefined
										});
									} else {
										var inv = request.query.start !== "" ? request.query.start : null;
										response.render('start.ejs', {
											"user": res,
											"invite": inv
										});
										console.log("User found " + res);
									}
								});
								break;
							}
						default:
							{
								response.sendFile(__dirname +
									'/hub/index.htm');
							}
					}
				});
				app.get('/callback', function(request, response) {
					console.log("Our callback called");
					response.render('callback', {});
				});

				app.get('/logoff', function(request, response) {
					response.clearCookie('sid', {
						path: '/'
					});
					response.status(200)
						.send("Ok");
				});

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
