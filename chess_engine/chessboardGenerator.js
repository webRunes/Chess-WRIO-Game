"use strict";

var Promise = require('es6-promise')
	.Promise;
var webshot = require('webshot');
var nconf = require("../wrio_nconf.js");

var chess = require('./chessEngineClient.js');

var line = function(args) {
	var args = args || {},
		lines = args.lines || '',
		chessboard = '<table style="text-align:center;border-spacing:0pt;border-collapse:collapse; border-color: black; border-style: solid; border-width: 1pt 1pt 1pt 1pt"><tbody>',
		startColor = 0;
	lines.forEach(function(cells, line) {
		var lineHTML = '<tr style="vertical-align:bottom;"><td style="vertical-align:middle;width:12pt">' + (-(line - 8)) + '</td>',
			cells = cells.split(''),
			color = startColor;
		cells.forEach(function(cell) {
			var cellDigit = parseInt(cell);
			if (cellDigit) {
				var i = 0;
				while (++i <= cellDigit) {
					if (!color) {
						lineHTML += '<td style="background:white; width:40pt; height:40pt; border-collapse:collapse; border-color: black; border-style: solid; border-width: 1pt 1pt 1pt 1pt"></td>';
					} else {
						lineHTML += '<td style="background:silver; border-collapse:collapse; border-color: black; border-style: solid; border-width: 1pt 1pt 1pt 1pt"></td>';
					}
					color = !color;
				}
			} else {
				switch (cell) {
					case 'p':
						cell = '&#9823;';
						break;
					case 'P':
						cell = '&#9817;';
						break;
					case 'r':
						cell = '&#9820;';
						break;
					case 'R':
						cell = '&#9814;';
						break;
					case 'n':
						cell = '&#9822;';
						break;
					case 'N':
						cell = '&#9816;';
						break;
					case 'b':
						cell = '&#9821;';
						break;
					case 'B':
						cell = '&#9815;';
						break;
					case 'q':
						cell = '&#9819;';
						break;
					case 'Q':
						cell = '&#9813;';
						break;
					case 'k':
						cell = '&#9818;';
						break;
					case 'K':
						cell = '&#9812;';
						break;
					default:
						break;
				}
				if (!color) {
					lineHTML += '<td style="background:white; width:40pt; height:40pt; border-collapse:collapse; border-color: black; border-style: solid; border-width: 1pt 1pt 1pt 1pt"><span style="font-size:250%;">' + cell + '</span></td>';
				} else {
					lineHTML += '<td style="background:silver; border-collapse:collapse; border-color: black; border-style: solid; border-width: 1pt 1pt 1pt 1pt"><span style="font-size:250%;">' + cell + '</span></td>';
				}
				color = !color;
			}
		});
		startColor = !startColor;
		chessboard += lineHTML + '</tr>';
	});
	chessboard += '<tr><td></td><td>a</td><td>b</td><td>c</td><td>d</td><td>e</td><td>f</td><td>g</td><td>h</td></tr></tbody></table><p style="color: #aaa; font-size: 13px; font-family: sans-serif; margin-top: 5px">Posted via Titter - Advanced tweets http://titter.wrioos.com</p>';
	return chessboard;
};

var generateFromFEN = function(args) {
	var args = args || {},
		fen = args.fen || '',
		boardFEN = fen.split(' ')[0],
		lines = boardFEN.split('/');
	return line({
		lines: lines
	});
};

exports.chessboard = function(args) {
	var args = args || {},
		fen = args.fen || '';
	return new Promise(function(resolve, reject) {
		chess.validateFen({
				fen: fen
			})
			.then(function() {
				var filename = './img/' + new Date()
					.getTime()
					.toString(32) + Math.random()
					.toString(32) + '.png';
				webshot(generateFromFEN({
					fen: fen
				}), filename, {
					siteType: 'html',
					shotSize: {
						width: 480,
						height: 480
					}
				}, function(err) {
					if (err) {
						reject(err);
					} else {
						resolve({
							filename: filename
						})
					}
				});
			})
			.catch(function(err) {
				reject(err);
			});
	});
}
