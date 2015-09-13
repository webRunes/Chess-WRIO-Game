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

	router.get('/access_callback', function(req, res) {
		var oauthToken = req.query.oauth_token || '',
			oauthVerifier = req.query.oauth_verifier || '';
		chessController.userAccessRequestCallback({
				oauthToken: oauthToken,
				oauthVerifier: oauthVerifier,
			})
			.then(function() {
				res.status(200)
					.send('<script>window.close()</script>');
			})
			.catch(function(err) {
				res.status(400)
					.send(err);
			});
	});

	router.get('/game/invite', function(req, res) {
		if (req.headers.referer) {
			chessController.startGameRequestCallback({
					invite: req.query.inv
				})
				.then(function(data) {
					console.log(data);
					res.status(200)
						.send('<script>window.close()</script>');
				})
				.catch(function(err) {
					console.log(err)
					res.status(400)
						.send(err);
				});
		}
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
