"use strict";

var Chess = require('./main')
	.Chess;
var chess = new Chess();
var Promise = require('es6-promise')
	.Promise;

exports.validateFen = function(args) {
	var args = args || {};
	return new Promise(function(resolve, reject) {
		var fen = args.fen || '';
		chess.validate_fen(fen, function(err, res) {
			if (err) {
				return reject(new Error(err.number + ' - ' + err.message));
			} else {
				resolve();
			}
		});
	});
};

exports.makeMove = function(args) {
	var args = args || {};
	return new Promise(function(resolve, reject) {
		var fen = args.fen || '',
			move = args.move || {},
			moveRigth = args.moveRigth || '';
		chess.validate_fen(fen, function(err, res) {
			if (err) {
				return reject(new Error(err.number + ' - ' + err.message));
			} else {
				if (fen.split(' ')[1] === moveRigth) {
					chess.load(fen);
					chess.move(move, function(err, res) {
						if (err) {
							return reject({
								bad: !0,
								message: "Wrong move."
							});
						} else {
							resolve({
								fen: chess.fen(),
								inCheckmate: chess.in_checkmate(),
								inCheck: chess.in_check()
							});
						}
					});
				} else {
					return reject({
						bad: !0,
						message: "It's not your turn."
					});
				}
			}
		});
	});
};
