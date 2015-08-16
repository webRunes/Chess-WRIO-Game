var moment = require('moment');
var _ = require('lodash');
var bigInt = require("big-integer");

var TitterClient = require('./titterClient');
var appData = require('../appData');

var CHESS_QUERY = '"#chess"';

exports.searchAndReply = function() {
	var query = {
		q: CHESS_QUERY,
		since_id: appData.getSinceId()
	};

	TitterClient.search({
			query: query
		})
		.then(function(statuses) {
			console.log('Titter:', 'Found', statuses.length, 'statuses');
			statuses.map(function(status) {
				var opponent = status.text.match(/^\#chess\sstart\s\@(.*)$/i);
				var move = status.text.match(/^\#chess\s([a-zA-Z][0-9])-([a-zA-Z][0-9])$/i);
				if (opponent) {
					TitterClient.startGame({
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
					TitterClient.move({
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
};
