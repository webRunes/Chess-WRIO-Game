var moment = require('moment');
var _ = require('lodash');
var bigInt = require("big-integer");

var TitterClient = require('./utils/titterClient');
var Chess = new(require('./persistent/controller.js'))();
var appData = require('./appData');


var $ = (function() {

	var $ = function() {

	}

	$.prototype = {
		db: {},
		CHESS_QUERY: '"#chess"',
		init: function(args, cb) {
			var args = args || {},
				db = args.db || {},
				$ = this;
			$.db = db;
			appData.init({
				db: $.db
			}, function(err) {
				cb(err);
			});
		},
		searchAndReply: function() {
			var $ = this,
				query = {
					q: $.CHESS_QUERY,
					since_id: appData.getSinceId()
				};
			Chess.init({
					db: $.db
				})
				.then(function() {
					return TitterClient.search({
						query: query
					});
				})
				.then(function(statuses) {
					console.log('Titter:', 'Found', statuses.length, 'statuses');

					var lastStatus = _.max(statuses, function(status) {
						return bigInt(status.id_str);
					});

					appData.setSinceId(lastStatus.id_str);

					var returned;

					statuses.map(function(status) {
						var query = {
							start: status.text.match(/start/),
							chess: status.text.match(/\#chess/),
							opponent: status.text.match(/\@([^\s]+)/i),
							move: status.text.match(/([a-hA-H][0-9])\-([a-hA-H][0-9])/i),
							command: status.text.match(/(refresh|help|end)/i)
						};
						if (query.chess && query.start && query.opponent) {
							if (status.text.replace(/(\#chess|start|\@[^\s]+|[^\w\sА-Яа-яЁё]|_|\s)/ig, '') === "") {
								console.log(status.user.screen_name, query.opponent)
								Chess.startGame({
										status: status,
										opponent: query.opponent[1]
									})
									.then(function(message) {
										console.log(message);
									})
									.catch(function(err) {
										console.log('app: ', err);
									});
							}
						} else if (query.chess && query.move) {
							if (status.text.replace(/(\#chess|\@[^\s]+|[a-hA-H][0-9]\-[a-hA-H][0-9]|[^\w\sА-Яа-яЁё]|_|\s)/ig, '') === "") {
								console.log(status.user.screen_name, query.move)
								Chess.move({
										status: status,
										move: {
											from: query.move[1],
											to: query.move[2]
										}
									})
									.then(function(message) {
										console.log(message);
									})
									.catch(function(err) {
										console.log('app: ', err);
									});
							}
						} else if (query.chess && query.command) {
							if (status.text.replace(/(\#chess|refresh|help|end|[^\w\sА-Яа-яЁё]|_|\s)/ig, '') === "") {
								console.log(status.user.screen_name, query.command[1])
								Chess[query.command[1]]({
										status: status
									})
									.then(function(message) {
										console.log(message);
									})
									.catch(function(err) {
										console.log('app: ', err);
									});
							}
						}
					});
				})
				.catch(function(err) {
					console.log('Titter:', 'Nothing found');
				});
		}
	}

	return $;

})();

module.exports = $;
