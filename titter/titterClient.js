var nconf = require("../wrio_nconf.js");
var request = require('superagent')
	.agent();

var twconf = {
	consumer_key: nconf.get("api:twitterLogin:consumerKey"),
	consumer_secret: nconf.get("api:twitterLogin:consumerSecret"),
	access_token: nconf.get("api:twitterLogin:access_token"),
	access_secret: nconf.get("api:twitterLogin:access_token_secret"),
	callback: nconf.get("api:twitterLogin:callback")
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
				var data = data || {};
				if (data.error) return reject(data.error);
				if (err) return reject(err);
				if (data.ok) resolve(data.body.statuses);
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
				var data = data || {};
				if (data.error) return reject(data.error);
				if (err) return reject(err);
				if (data.ok) resolve(data.body.statuses);
			});
	});
};

/*exports.access = function(args) {
	var status = args.status || {},
		opponent = args.opponent || '';
	console.log('Titter:', 'Access request to ' + status.user.screen_name)
	return new Promise(function(resolve, reject) {
		request
			.post(titterUrl + '/api/access')
			.send({
				status: status,
				opponent: opponent
			})
			.end(function(err, res) {
				var res = res || {};
				if (res.error) return reject(res.error);
				if (err) return reject(err);
				if (res.ok) resolve();
			});
	});
}

exports.gameStart = function(user, opponent) {
	console.log('Titter:', 'Game start request to ' + opponent);
	return new Promise(function(resolve, reject) {
		request
			.post(titterUrl + '/api/gameStart')
			.send({
				twitterCreds: twconf,
				user: user,
				opponent: opponent
			})
			.end(function(err, res) {
				if (res.error) return reject(new Error(res.text));
				if (err) return reject(err);

				if (res.ok) resolve(res.body.res);
			});
	});
}

exports.reply = function(statuses) {
	return new Promise(function(resolve, reject) {
		request
			.post(titterUrl + '/api/replyAll')
			.send({
				twitterCreds: twconf,
				statuses: statuses,
				message: 'Game started'
			})
			.end(function(err, response) {
				if (response.error) return reject(new Error(response.text));
				if (err) return reject(err);

				if (response.ok) resolve('Successfully replied');
			});
	});
}
*/
