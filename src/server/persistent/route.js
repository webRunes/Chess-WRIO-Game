"use strict";

var express = require('express');
var TwitterClient = require("../utils/twitterClient");
var fs = require("fs");

var $ = function(args, cb) {

	var $ = this,
		args = args || {},
		db = args.db || {},
		cb = cb || function() {},
		router = express.Router(),
		chessController = args.chessController || {};

	router.post('/access_callback', function(req, res) {
		var user = req.body.user || '';
		var uuid = req.body.uuid;
		chessController.userAccessRequestCallback({
				user: user,
				uuid: uuid
			})
			.then(function() {
				res.status(200)
					.send("ok");
				if (uuid) {
					return chessController.getParamsByUUID({
						uuid: uuid
					});
				}
			})
			.then(function(data) {
				return chessController.getUsernameByID({
					titterID: data.titterID
				});
			})
			.then(function(_data) {
				if (_data.verified) {
					db.collection("chess_uuids")
						.deleteOne({
							uuid: uuid
						}, function(err, res) {
							console.log(err, res)
						});
				}
			})
			.catch(function(err) {
				res.status(400)
					.send(err);
			});
	});

	router.post('/invite_callback', function(req, res) {
		var uuid = req.body.uuid,
			chess = db.collection('chess');
		chessController.startGameRequestCallback({
				user: req.body.user,
				invite: req.body.invite,
				uuid: uuid
			})
			.then(function(data) {
				res.status(200)
					.send("ok");
				if (uuid) {
					return chessController.getParamsByUUID({
						uuid: uuid
					});
				}
			})
			.then(function(data) {
				chess.find({
						invite: data.invite
					})
					.toArray(function(err, _data) {
						console.log(_data[0].status)
						if (_data && _data[0] && _data[0].status && _data[0].status === 1) {
							db.collection("chess_uuids")
								.deleteOne({
									uuid: uuid
								}, function(err, res) {
									console.log(err)
								});
						}
					})
			})
			.catch(function(err) {
				console.log("route error: ", err)
				res.status(400)
					.send(err);
			});
	});

	return router;
}

module.exports = $;
