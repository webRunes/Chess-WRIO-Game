"use strict";

var Promise = require('es6-promise')
	.Promise,
	nconf = require("../wrio_nconf.js"),
	crypto = require("crypto");

exports.generateToken = function(args) {
	return new Promise(function(resolve, reject) {
		crypto.randomBytes(7, function(ex, buf) {
			console.log(buf.toString('hex'))
			resolve({
				uuid: buf.toString('hex')
			});
		});
	});
};
