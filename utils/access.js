"use strict";

var TwitterClient = require("../utils/twitterClient"),
	titter = require("./titterClient"),
	nconf = require("../wrio_nconf.js"),
	secure = require("./secure.js"),
	Promise = require('es6-promise')
	.Promise,

	//var chessUrl = 'chess' + nconf.get("server:workdomain");
	chessUrl = '127.0.0.1:5005'; //'chess' + nconf.get("server:workdomain");

exports.auth = function(args) {
	var args = args || {},
		status = args.status || {},
		opponent = args.opponent || '',
		name = status.user.screen_name || '',
		creds = args.creds || {},
		db = args.db || {},
		users = db.collection('users'),
		webRunes_Users = db.collection('webRunes_Users'),
		twitter = TwitterClient.Client(creds);
	return new Promise(function(resolve, reject) {
		webRunes_Users.find({
				titterID: status.user.id_str
			})
			.toArray(function(err, data) {
				if (err || data.length === 0) {
					accessRequest({
							status: status,
							name: name,
							creds: creds,
							is_callback: args.is_callback
						})
						.then(function(res) {
							users.insert([{
								name: name,
								titterID: status.user.id_str,
								last_opponent: opponent
							}], function(err, res) {
								reject(err);
							});
						})
						.catch(function(err) {
							reject(err);
						});
				} else {
					twitter.verifyCredentials(data[0].token, data[0].tokenSecret, function(error, _data, res) {
						if (error) {
							console.log("error: ", error)
							accessRequest({
									status: status,
									name: name,
									creds: creds,
									db: db,
									is_callback: args.is_callback
								})
								.then(function(res) {
									users.find({
											titterID: status.user.id_str
										})
										.toArray(function(err, data) {
											if (err || data.length === 0) {
												users.insert([{
													name: name,
													titterID: status.user.id_str,
													last_opponent: opponent
												}], function(err, res) {
													reject(err);
												});
											} else {
												users.update({
													name: name
												}, {
													$set: {
														last_opponent: opponent
													}
												}, function(err, res) {
													reject(err);
												});
											}
										});
								})
								.catch(function(err) {
									reject(err);
								});
						} else {
							users.find({
									titterID: status.user.id_str
								})
								.toArray(function(err, _data) {
									if (err || _data.length === 0) {
										users.insert([{
											name: name,
											titterID: status.user.id_str,
											last_opponent: opponent
										}], function(err, res) {
											if (err) {
												reject(err);
											} else {
												resolve({
													name: name,
													last_opponent: opponent,
													titterID: status.user.id_str,
													access: {
														token: data[0].token,
														tokenSecret: data[0].tokenSecret
													}
												});
											}
										});
									} else {
										resolve({
											name: name,
											last_opponent: opponent,
											titterID: status.user.id_str,
											access: {
												token: data[0].token,
												tokenSecret: data[0].tokenSecret
											}
										});
									}
								});
						}
					});
				}
			});
	});
};

var accessRequest = function(args) {
	var args = args || {},
		status = args.status || {},
		name = args.name || '',
		db = args.db || {},
		creds = args.creds || {};
	return new Promise(function(resolve, reject) {
		var twitter = args.is_callback ? TwitterClient._Client(creds) : TwitterClient.Client(creds),
			_ = args.is_callback ? !0 : !1;
		twitter.getRequestToken(function(err, requestToken, requestTokenSecret, results) {
			if (err) {
				reject(err);
			} else {
				secure.generateToken()
					.then(function(res) {
						var uuids = db.collection('chess_uuids'),
							uuid = res.token;
							console.log(typeof uuid)
						uuids.insert([{
							uuid: uuid,
							titterID: status.user.id_str
						}], function(err, data) {
							if (!err) {
								var message = '@' + name + ', click ' + chessUrl + '?start=' + uuid + ' to start the game';
								titter.reply({
										user: name,
										message: message,
										access: {
											accessToken: creds.access_token,
											accessTokenSecret: creds.access_secret
										},
										_: _
									})
									.then(function() {
										resolve({
											requestToken: requestToken,
											requestTokenSecret: requestTokenSecret
										});
									})
									.catch(function(err) {
										reject(err);
									});
							} else {
								reject(err);
							}
						});
					});
			}
		});
	});
};
