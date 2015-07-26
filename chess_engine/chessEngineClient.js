"use strict";

var Chess = require('./chess')
	.Chess;

exports.startGame = function() {
	return new Promise(function(resolve, reject) {
		var chess = new Chess();
		resolve({
			fen: chess.fen()
		});
	});
};

exports.makeMove = function(args) {
	var args = args || {};
	return new Promise(function(resolve, reject) {
		var chess = new Chess();
		var fen = args.fen || '';
		var move = args.move || {};
		chess.validate_fen(fen, function(err, res) {
			if (err) {
				return reject(new Error(err.number + ' - ' + err.message));
			} else {
				chess.load(fen);
				chess.move(move, function(err, res) {
					if (err) {
						return reject(new Error("Invalid move"));
					} else {
						resolve({
							fen: chess.fen(),
							isGameOver: chess.game_over(),
							isCheck: chess.check();
						});
					}
				});
			}
		});
	});
};
