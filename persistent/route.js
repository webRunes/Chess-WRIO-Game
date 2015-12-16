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
				if (uuid) {
					chessController.getParamsByUUID({
							uuid: uuid
						})
						.then(function(data) {
							chessController.getUsernameByID({
									titterID: data.titterID
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
								});
						});
				}

				res.status(200)
					.send("ok");
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
				if (uuid) {
					chessController.getParamsByUUID({
							uuid: uuid
						})
						.then(function(data) {
							chess.find({
									invite: data.invite
								})
								.toArray(function(err, _data) {
									if (_data.status === 1) {
										db.collection("chess_uuids")
											.deleteOne({
												uuid: uuid
											}, function(err, res) {
												console.log(err, res)
											});
									}
								});
						});
				}
				res.status(200)
					.send("ok");
			})
			.catch(function(err) {
				console.log("route error: ", err)
				res.status(400)
					.send(err);
			});
	});

	router.get('/game/invite/access_callback', function(req, res) {
		var oauthToken = req.query.oauth_token,
			oauthVerifier = req.query.oauth_verifier;
		chessController.opponentAccessRequestCallback({
				oauthToken: oauthToken,
				oauthVerifier: oauthVerifier,
			})
			.then(function(data) {
				console.log(data)
				res.status(200)
					.send('<script>window.close()</script>');
			})
			.catch(function(err) {
				console.log(err)
				res.status(400)
					.send(err);
			});
	});

	return router;
}

module.exports = $;
