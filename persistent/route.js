"use strict";

var express = require('express');
var TwitterClient = require("../utils/twitterClient");
var chessController = new(require('./controller.js'))();
var fs = require("fs");

var $ = function(args, cb) {

	var $ = this,
		args = args || {},
		db = args.db || {},
		cb = cb || function() {},
		router = express.Router();

	chessController.init({
		db: db
	});

	router.post('/access_callback', function(req, res) {
		var user = req.body.user || '';
		chessController.userAccessRequestCallback({
				user: user
			})
			.then(function() {
				res.status(200)
					.send("ok");
			})
			.catch(function(err) {
				res.status(400)
					.send(err);
			});
	});

	router.post('/invite_callback', function(req, res) {
		console.log(req.body);
		chessController.startGameRequestCallback({
				user: req.body.user,
				invite: req.body.invite
			})
			.then(function(data) {
				console.log(data);
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
