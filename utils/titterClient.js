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

var titterUrl = nconf.get("api:titterUrl");

exports.search = function(args) {
	var args = args || {},
		query = args.query || '';
	return new Promise(function(resolve, reject) {
		request
			.post(titterUrl + '/api/search')
			.send({
				twitterCreds: twconf,
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

exports.replyAll = function(args) {
	var args = args || {},
		statuses = args.statuses || [],
		message = args.message || '';
	return new Promise(function(resolve, reject) {
		request
			.post(titterUrl + '/api/replyAll')
			.send({
				twitterCreds: twconf,
				statuses: statuses,
				message: message
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

exports.reply = function(args) {
	var args = args || {},
		user = args.user || '',
		access = args.access || {},
		message = args.message || '',
		media_ids = args.media_ids,
		_ = args._ || !1;
	return new Promise(function(resolve, reject) {
		request
			.post(titterUrl + '/api/reply')
			.send({
				creds: twconf,
				user: user,
				access: access,
				message: message,
				media_ids: media_ids,
				_: _
			})
			.end(function(err, data) {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
	});
};

exports.uploadMedia = function(args) {
	var args = args || {},
		user = args.user || '',
		access = args.access || {},
		filename = args.filename || '',
		message = args.message || '',
		_ = args._ || !1;
	return new Promise(function(resolve, reject) {
		request
			.post(titterUrl + '/api/uploadMedia')
			.send({
				creds: twconf,
				user: user,
				filename: filename,
				access: access,
				_: _
			})
			.end(function(err, data) {
				if (err) {
					reject(err);
				} else {
					resolve(data.body.data);
				}
			});
	});
};
