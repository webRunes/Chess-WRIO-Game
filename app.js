var moment = require('moment');
var _ = require('lodash');
var bigInt = require("big-integer");

var TitterClient = require('./utils/titterClient');
var Chess = new(require('./persistent/controller.js'))();
var appData = require('./appData');

var CHESS_QUERY = '"#chess"';

exports.searchAndReply = function(args) {
	var args = args || {},
		db = args.db || {},
		query = {
			q: CHESS_QUERY,
			since_id: appData.getSinceId()
		};
	Chess.init({
			db: db
		})
		.then(function() {
			TitterClient.search({
					query: query
				})
				.then(function(statuses) {
					console.log('Titter:', 'Found', statuses.length, 'statuses');
					statuses.map(function(status) {
						var opponent = status.text.match(/^\#chess\sstart\s\@(.*)$/i);
						var move = status.text.match(/^\#chess\s([a-zA-Z][0-9])-([a-zA-Z][0-9])$/i);
						if (opponent) {
							console.log(status.user.screen_name, opponent)
							Chess.startGame({
									status: status,
									opponent: opponent[1]
								})
								.then(function(message) {
									console.log(message);
								})
								.catch(function(err) {
									console.log('Titter:', err.text || err.message || err)
								});

						} else if (move) {
							Chess.move({
									status: status,
									move: {
										from: move[1],
										to: move[2]
									}
								})
								.then(function(message) {
									console.log(message);
								})
								.catch(function(err) {
									console.log('Titter:', err.text || err.message || err)
								});
						}
					});

					var lastStatus = _.max(statuses, function(status) {
						return bigInt(status.id_str);
					});

					appData.setSinceId(lastStatus.id_str);

					return statuses;
				})
				.catch(function(err) {
					console.log('Titter:', err.text || err.message || err);
				});
		})
		.catch(function(err) {
			console.log(err)
		});
};
