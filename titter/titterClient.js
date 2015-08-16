var nconf = require("../wrio_nconf.js");
var request = require('superagent')
	.agent();
var Promise = require('es6-promise')
	.Promise;

var twconf = {
	consumer_key: nconf.get("api:twitterLogin:consumerKey"),
	consumer_secret: nconf.get("api:twitterLogin:consumerSecret"),
	access_token: nconf.get("api:twitterLogin:access_token"),
	access_secret: nconf.get("api:twitterLogin:access_token_secret"),
	callback: nconf.get("api:twitterLogin:callback"),
	_callback: nconf.get("api:twitterLogin:_callback")
};

var titterUrl = nconf.get('api:titterUrl');

exports.search = function(args) {
	var query = args.query || '';
	console.log('Titter:', 'Start searching for new twits')
	return new Promise(function(resolve, reject) {
		request
			.post(titterUrl + '/api/search')
			.send({
				twitterCreds: twconf,
				titterUrl: titterUrl,
				query: query
			})
			.end(function(err, data) {
				if (err) {
					reject(err);
				} else {
					resolve(data.body.statuses);
				}
			});
	});
};

exports.startGame = function(args) {
	var status = args.status || '',
		opponent = args.opponent || '';
	return new Promise(function(resolve, reject) {
		request.post(titterUrl + '/api/game/start')
			.send({
				status: status,
				opponent: opponent
			})
			.end(function(err, data) {
				if (err) {
					reject(err);
				} else {
					resolve(data.body.message);
				}
			});
	});
};

exports.move = function(args) {
	var status = args.status || '',
		move = args.move || '';
	return new Promise(function(resolve, reject) {
		request.post(titterUrl + '/api/game/move')
			.send({
				status: status,
				move: move
			})
			.end(function(err, data) {
				if (err) {
					reject(err);
				} else {
					resolve(data.body.message);
				}
			});
	});
};
