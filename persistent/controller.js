"use strict";

var titter = require("../utils/titterClient");
var Promise = require('es6-promise')
	.Promise;
var access = require('../utils/access.js');
var nconf = require("../wrio_nconf.js");

var $ = (function() {

	var $ = function() {};

	$.prototype = {
		db: {},
		chessUrl: nconf.get("api:chessUrl"),
		creds: {
			consumer_key: nconf.get("api:twitterLogin:consumerKey"),
			consumer_secret: nconf.get("api:twitterLogin:consumerSecret"),
			access_token: nconf.get("api:twitterLogin:access_token"),
			access_secret: nconf.get("api:twitterLogin:access_token_secret"),
			callback: nconf.get("api:twitterLogin:callback"),
			_callback: nconf.get("api:twitterLogin:_callback")
		},
		init: function(args) {
			var $ = this,
				args = args || {};
			return new Promise(function(resolve, reject) {
				$.db = args.db;
				if ($.db) {
					resolve();
				} else {
					reject();
				};
			});
		},
		startGame: function(args) {
			var $ = this,
				args = args || {},
				status = args.status || {},
				opponent = args.opponent || '';
			return new Promise(function(resolve, reject) {
				access.auth({
						status: status,
						opponent: opponent,
						creds: $.creds,
						db: $.db
					})
					.then(function(res) {
						$.startGameRequest(res)
							.then(function(args) {
								resolve(args.message);
							})
							.catch(function(err) {
								reject(err);
							});
					})
					.catch(function(err) {
						if (err) {
							reject(err);
						} else {
							resolve('New user. Access request to @' + status.user.screen_name);
						}
					});
			});
		},
		startGameRequest: function(args) {
			var $ = this,
				args = args || {},
				name = args.name || '',
				opponent = args.last_opponent || '',
				accessToken = args.accessToken || '',
				accessTokenSecret = args.accessTokenSecret || '';
			return new Promise(function(resolve, reject) {
				var chess = $.db.collection('chess'),
					inv = new Date()
					.getTime()
					.toString(32) + Math.random()
					.toString(32),
					message = '@' + opponent + " Join to game " + $.chessUrl + "/api/game/invite?inv=" + inv;
				chess.find({
						name: name,
						opponent: opponent
					})
					.toArray(function(err, data) {
						if (!err) {
							var norm = !0;
							if (data.length === 0) {
								chess.insert([{
									invite: inv,
									name: name,
									opponent: opponent,
									status: 0
								}], function(err, res) {
									if (err) {
										reject(err);
										norm = !1;
									}
								});
							} else {
								chess.update({
									name: name,
									opponent: opponent
								}, {
									$set: {
										invite: inv,
										status: 0
									}
								}, function(err, data) {
									if (err) {
										reject(err);
										norm = !1;
									}
								});
							}
							if (norm) {
								titter.reply({
										user: opponent,
										access: {
											accessToken: accessToken,
											accessTokenSecret: accessTokenSecret
										},
										message: message
									})
									.then(function() {
										resolve({
											message: 'Start game request from @' + name + ' to @' + opponent
										});
									})
									.catch(function(err) {
										reject(err);
									});
							}
						} else {
							reject(err);
						}
					});
			});
		},
		userAccessRequestCallback: function(args) {
			var $ = this,
				args = args || {};
			return new Promise(function(resolve, reject) {
				args.db = $.db;
				args.creds = $.creds;
				access.setAccessToken(args)
					.then(function(args) {
						$.startGameRequest(args)
							.then(function(res) {
								resolve(res.message);
							})
							.catch(function(err) {
								reject(err);
							});
					})
					.catch(function(err) {
						reject(err);
					});
			});
		},
		opponentAccessRequestCallback: function(args) {
			var $ = this,
				args = args || {};
			return new Promise(function(resolve, reject) {
				args.db = $.db;
				args.creds = $.creds;
				access.setAccessToken(args)
					.then(function(args) {
						$.startGameRequestAccept(args)
							.then(function(data) {
								resolve(data.message);
							})
							.catch(function(err) {
								reject(err);
							});
					})
					.catch(function(err) {
						reject(err);
					});
			});
		},
		startGameRequestCallback: function(args) {
			var $ = this,
				args = args || {},
				invite = args.invite,
				chess = $.db.collection('chess');
			return new Promise(function(resolve, reject) {
				chess.find({
						invite: invite
					})
					.toArray(function(err, data) {
						if (err || !data[0]) {
							reject(err || 'Invalid or expired invite token');
						} else {
							access.auth({
									status: {
										user: {
											screen_name: data[0].opponent
										},
										id_str: null
									},
									opponent: data[0].name,
									creds: $.creds,
									db: $.db,
									is_callback: !0
								})
								.then(function(res) {
									$.startGameRequestAccept(res)
										.then(function(res) {
											resolve(res.message);
										})
										.catch(function(err) {
											reject(err);
										});
								})
								.catch(function(err) {
									if (err) {
										reject(err);
									} else {
										resolve('New user. Access request to @' + data[0].opponent);
									}
								});
						}
					});
			});
		},
		startGameRequestAccept: function(args) {
			var $ = this,
				args = args || {},
				name = args.last_opponent || '',
				opponent = args.name || '',
				accessToken = args.accessToken || '',
				accessTokenSecret = args.accessTokenSecret || '';
			return new Promise(function(resolve, reject) {
				var chess = $.db.collection('chess');
				chess.update({
					name: name,
					opponent: opponent
				}, {
					$set: {
						status: 1
					}
				}, function(err, res) {
					if (err) {
						reject(err);
					} else {
						var message = '@' + name + " Game started!";
						titter.reply({
								user: name,
								message: message,
								access: {
									accessToken: accessToken,
									accessTokenSecret: accessTokenSecret
								}
							})
							.then(function() {
								resolve({
									message: '@' + opponent + ' accept game request from @' + name
								});
							})
							.catch(function(err) {
								reject(err);
							});
					}
				});
			});
		},
		move: function(args) {
			var $ = this,
				args = args || {},
				status = args.status || {},
				move = args.move || {};
			return new Promise(function(resolve, reject) {
				resolve('Move ' + move.from + '-' + move.to + ' by @' + status.user.screen_name);
			});
		}
	}
	return $;

})();

module.exports = $;
