"use strict";

var titter = require("../utils/titterClient");
var Promise = require('es6-promise')
	.Promise;
var access = require('../utils/access.js');
var nconf = require("../wrio_nconf.js");
var chessClient = require('../chess_engine/chessEngineClient.js');
var chessboardGenerator = require('../chess_engine/chessboardGenerator.js');

var $ = (function() {

	var $ = function() {};

	$.prototype = {
		db: {},
		infoText: 'Visit http://chess.wrioos.com for info.',
		chessUrl: 'chess' + nconf.get("server:workdomain"),
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
				var chess = $.db.collection('chess');
				chess.find({
						$or: [{
							name: status.user.screen_name,
							$or: [{
								status: 1
							}, {
								status: 0
							}]
						}, {
							opponent: status.user.screen_name,
							$or: [{
								status: 1
							}, {
								status: 0
							}]
						}]
					})
					.toArray(function(err, data) {
						if (data && data[0]) {
							titter.drawComment({
									message: 'The game in progress! Please send "#chess end" if you would like to stop the current game.',
									access: {
										accessToken: $.creds.access_token,
										accessTokenSecret: $.creds.access_secret
									}
								})
								.then(function(__data) {
									try {
										__data = JSON.parse(__data);
									} catch (e) {}
									titter.reply({
											user: status.user.screen_name,
											message: '@' + status.user.screen_name,
											media_ids: __data.media_id_string,
											in_reply_to_status_id: status.id_str,
											access: {
												accessToken: $.creds.access_token,
												accessTokenSecret: $.creds.access_secret
											}
										})
										.then(function() {
											resolve({
												message: 'Game started yet!'
											})
										})
										.catch(function(err) {
											reject(err);
										});
								})
								.catch(function(err) {
									reject(err);
								});
						} else {
							chess.find({
									$or: [{
										name: opponent,
										$or: [{
											status: 1
										}, {
											status: 0
										}]
									}, {
										opponent: opponent,
										$or: [{
											status: 1
										}, {
											status: 0
										}]
									}]
								})
								.toArray(function(err, data) {
									if (data && data[0]) {
										var users = $.db.collection('users');
										var _opponent = data[0].name === opponent ? data[0].opponent : data[0].name;
										users.find({
												name: opponent
											})
											.toArray(function(err, data) {
												if (data && data[0]) {
													titter.drawComment({
															message: '@' + status.user.screen_name + ', sorry, I`m already playing with @' + _opponent,
															access: {
																accessToken: data[0].accessToken,
																accessTokenSecret: data[0].accessTokenSecret
															}
														})
														.then(function(__data) {
															try {
																__data = JSON.parse(__data);
															} catch (e) {}
															titter.reply({
																	user: opponent,
																	message: '@' + status.user.screen_name,
																	media_ids: __data.media_id_string,
																	in_reply_to_status_id: status.id_str,
																	access: {
																		accessToken: data[0].accessToken,
																		accessTokenSecret: data[0].accessTokenSecret
																	}
																})
																.then(function() {
																	resolve({
																		message: 'Opponent is busy!'
																	})
																})
																.catch(function(err) {
																	reject(err);
																});
														})
														.catch(function(err) {
															reject(err);
														});
												} else {
													resolve({
														message: 'Undefined user.'
													})
												}
											});
									} else {
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
									}
								});
						}
					});
			});
		},
		startGameRequest: function(args) {
			var $ = this,
				args = args || {},
				name = args.name || '',
				opponent = args.last_opponent || '';
			return new Promise(function(resolve, reject) {
				var chess = $.db.collection('chess'),
					inv = new Date()
					.getTime()
					.toString(32) + Math.random()
					.toString(32),
					message = '@' + opponent + ", I'm inviting you to play chess, click on " + $.chessUrl + "/api/game/invite?inv=" + inv;
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
									status: 0,
									fen: '',
									last_move: {}
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
										status: 0,
										invite: inv
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
											accessToken: $.creds.access_token,
											accessTokenSecret: $.creds.access_secret
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
				var chess = $.db.collection('chess'),
					fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
				chess.update({
					name: name,
					opponent: opponent
				}, {
					$set: {
						status: 1,
						fen: fen,
						invite: ''
					}
				}, function(err, res) {
					if (err) {
						reject(err);
					} else {
						var message = '@' + name + ' Game started! Send \"#chess help\" to get help';
						chessboardGenerator.chessboard({
								fen: fen
							})
							.then(function(res) {
								titter.uploadMedia({
										user: name,
										filename: res.filename || '',
										access: {
											accessToken: accessToken,
											accessTokenSecret: accessTokenSecret
										}
									})
									.then(function(data) {
										try {
											data = JSON.parse(data);
										} catch (e) {}
										titter.reply({
												user: name,
												media_ids: data.media_id_string,
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
									})
									.catch(function(err) {
										reject(err);
									});
							})
							.catch(function(err) {
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
				var chess = $.db.collection('chess');
				var users = $.db.collection('users');
				chess.find({
						$or: [{
							name: status.user.screen_name
						}, {
							opponent: status.user.screen_name
						}],
						status: 1
					})
					.toArray(function(err, data) {
						if (data && data[0]) {
							var name = (data[0].name === status.user.screen_name) ? data[0].opponent : data[0].name,
								moveRigth = (data[0].name === status.user.screen_name) ? 'w' : 'b',
								message = '@' + name + ' ' + move.from + '-' + move.to + '. ' + $.infoText;
							chessClient.makeMove({
									fen: data[0].fen,
									move: move,
									moveRigth: moveRigth
								})
								.then(function(res) {
									var _status = 1;
									if (res.inCheckmate) {
										message += '. Checkmate. @' + status.user.screen_name + ' wins! ' + $.infoText;
										_status = 2;
									} else if (res.inCheck) {
										message += '. Check! ' + $.infoText;
										_status = 2;
									}
									chessboardGenerator.chessboard({
											fen: res.fen
										})
										.then(function(_res) {
											var filename = _res.filename || '';
											users.find({
													name: status.user.screen_name
												})
												.toArray(function(err, _data) {
													if (_data && _data[0]) {
														titter.uploadMedia({
																user: status.user.screen_name,
																filename: filename,
																access: {
																	accessToken: _data[0].accessToken,
																	accessTokenSecret: _data[0].accessTokenSecret
																}
															})
															.then(function(__data) {
																try {
																	__data = JSON.parse(__data);
																} catch (e) {}
																chess.update(data[0], {
																	$set: {
																		fen: res.fen,
																		status: _status,
																		last_move: move
																	}
																}, function(err, res) {
																	if (err) {
																		reject(err);
																	} else {
																		titter.reply({
																				user: status.user.screen_name,
																				media_ids: __data.media_id_string,
																				message: message,
																				in_reply_to_status_id: status.id_str,
																				access: {
																					accessToken: _data[0].accessToken,
																					accessTokenSecret: _data[0].accessTokenSecret
																				}
																			})
																			.then(function() {
																				resolve({
																					message: 'Move ' + move.from + '-' + move.to + ' by @' + status.user.screen_name
																				});
																			})
																			.catch(function(err) {
																				reject(err);
																			});
																	}
																});
															})
															.catch(function(err) {
																reject(err);
															});
													} else if (err) {
														reject(err);
													} else {
														reject('User @' + name + ' not found');
													}
												});
										})
										.catch(function(err) {
											reject(err);
										});
								})
								.catch(function(err) {
									if (err.bad) {
										titter.reply({
												user: status.user.screen_name,
												message: '@' + status.user.screen_name + ' ' + move.from + '-' + move.to + '. ' + err.message + '. ' + $.infoText,
												in_reply_to_status_id: status.id_str,
												access: {
													accessToken: $.creds.access_token,
													accessTokenSecret: $.creds.access_secret
												}
											})
											.then(function() {
												resolve({
													message: err.message
												});
											})
											.catch(function(err) {
												reject(err);
											});
									} else {
										reject(err);
									}
								});
						} else if (err) {
							reject(err);
						} else {
							reject('No chess');
						}
					});
			});
		},
		refresh: function(args) {
			var $ = this,
				args = args || {},
				status = args.status || {};
			return new Promise(function(resolve, reject) {
				var chess = $.db.collection('chess');
				chess.find({
						$or: [{
							name: status.user.screen_name
						}, {
							opponent: status.user.screen_name
						}],
						status: 1
					})
					.toArray(function(err, data) {
						if (data && data[0]) {
							var name = (data[0].fen.split(' ')[1] === 'w') ? data[0].opponent : data[0].name,
								turn = name === status.user.screen_name ? 'Opponent`s turn. ' : 'Your turn. ',
								message = '@' + status.user.screen_name + ', last move was ' + data[0].last_move.from + '-' + data[0].last_move.to + '. ' + turn + $.infoText;
							chessboardGenerator.chessboard({
									fen: data[0].fen
								})
								.then(function(_res) {
									var filename = _res.filename || '';
									titter.uploadMedia({
											user: status.user.screen_name,
											filename: filename,
											access: {
												accessToken: $.creds.access_token,
												accessTokenSecret: $.creds.access_secret
											}
										})
										.then(function(__data) {
											try {
												__data = JSON.parse(__data);
											} catch (e) {}
											titter.reply({
													user: status.user.screen_name,
													media_ids: __data.media_id_string,
													message: message,
													in_reply_to_status_id: status.id_str,
													access: {
														accessToken: $.creds.access_token,
														accessTokenSecret: $.creds.access_secret
													}
												})
												.then(function() {
													resolve({
														message: 'Refresh. Move ' + data[0].last_move.from + '-' + data[0].last_move.to + ' by @' + name
													});
												})
												.catch(function(err) {
													reject(err);
												});
										})
										.catch(function(err) {
											reject(err);
										});
								})
								.catch(function(err) {
									reject(err);
								});
						} else if (err) {
							reject(err);
						} else {
							reject('No chess');
						}
					});
			});
		},
		help: function(args) {
			var $ = this,
				args = args || {},
				status = args.status || {};
			return new Promise(function(resolve, reject) {
				titter.drawComment({
						message: 'help',
						access: {
							accessToken: $.creds.access_token,
							accessTokenSecret: $.creds.access_secret
						}
					})
					.then(function(__data) {
						try {
							__data = JSON.parse(__data);
						} catch (e) {}
						titter.reply({
								user: status.user.screen_name,
								media_ids: __data.media_id_string,
								message: '@' + status.user.screen_name,
								in_reply_to_status_id: status.id_str,
								access: {
									accessToken: $.creds.access_token,
									accessTokenSecret: $.creds.access_secret
								}
							})
							.then(function() {
								resolve({
									message: 'Help'
								});
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
		end: function(args) {
			var $ = this,
				args = args || {},
				status = args.status || {};
			return new Promise(function(resolve, reject) {
				var chess = $.db.collection('chess');
				chess.find({
						$or: [{
							name: status.user.screen_name,
							$or: [{
								status: 0
							}, {
								status: 1
							}]
						}, {
							opponent: status.user.screen_name,
							$or: [{
								status: 0
							}, {
								status: 1
							}]
						}]
					})
					.toArray(function(err, data) {
						if (data && data[0]) {
							var name = (data[0].name === status.user.screen_name) ? data[0].opponent : data[0].name,
								message = 'You gave up, @' + name + ' wins!',
								_message = 'Your opponent gave up, you wins!';
							chess.update(data[0], {
									$set: {
										status: 2
									}
								},
								function(err, res) {
									if (err) {
										reject(err);
									} else {
										titter.drawComment({
												message: message,
												access: {
													accessToken: $.creds.access_token,
													accessTokenSecret: $.creds.access_secret
												}
											})
											.then(function(__data) {
												try {
													__data = JSON.parse(__data);
												} catch (e) {}
												titter.reply({
														user: status.user.screen_name,
														message: '@' + status.user.screen_name + ', ' + $.infoText,
														media_ids: __data.media_id_string,
														in_reply_to_status_id: status.id_str,
														access: {
															accessToken: $.creds.access_token,
															accessTokenSecret: $.creds.access_secret
														}
													})
													.then(function() {})
													.catch(function(err) {
														reject(err);
													});
											})
											.catch(function(err) {
												reject(err);
											});
										titter.drawComment({
												message: _message,
												access: {
													accessToken: $.creds.access_token,
													accessTokenSecret: $.creds.access_secret
												}
											})
											.then(function(__data) {
												try {
													__data = JSON.parse(__data);
												} catch (e) {}
												titter.reply({
														user: name,
														message: '@' + name + ', ' + $.infoText,
														media_ids: __data.media_id_string,
														access: {
															accessToken: $.creds.access_token,
															accessTokenSecret: $.creds.access_secret
														}
													})
													.then(function() {})
													.catch(function(err) {
														reject(err);
													});
											})
											.catch(function(err) {
												reject(err);
											});
										resolve({
											message: '@' + status.user.screen_name + ' gave up!'
										})
									}
								});
						} else if (err) {
							reject(err);
						} else {
							reject('No chess');
						}
					});
			});
		}
	}
	return $;

})();

module.exports = $;
