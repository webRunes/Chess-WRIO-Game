var nconf = require("./wrio_nconf.js");
var Promise = require('es6-promise').Promise;
var request = require('superagent');

var twconf = {
	consumer_key: nconf.get("api:twitterLogin:consumerKey"),
	consumer_secret: nconf.get("api:twitterLogin:consumerSecret"),
	access_token: nconf.get("api:twitterLogin:access_token"),
	access_token_secret: nconf.get("api:twitterLogin:access_token_secret")
};

var titterUrl = nconf.get('api:titterUrl');

exports.search = function(query) {
	return new Promise(function(resolve, reject) {
		request
			.post(titterUrl + '/api/search')
			.send({
				twitterCreds: twconf,
				query: query
			})
			.end(function(err, response) {
				if (err) return reject(err);

				if (response.notFound) {
					return reject(new Error(response.text));
				}

				if(response.ok) {
					resolve(response.body.statuses);
				}
			});
	});
};

exports.reply = function(statuses) {
	return new Promise(function(resolve, reject) {
		request
			.post(titterUrl + '/api/replyAll')
			.send({
				twitterCreds: twconf,
				statuses: statuses,
				message: 'Game started ' + (Math.random() * 1000).toFixed(0)
			}).end(function(err, response) {
				if (err) return reject(err);

				if (response.notFound) {
					return reject(new Error(response.text));
				}

				if(response.ok) {
					resolve('Successfully replied');
				}	
			});
	});
}