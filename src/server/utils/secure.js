"use strict";

var Promise = require('es6-promise')
    .Promise,
    nconf = require("../wrio_nconf.js"),
    crypto = require("crypto");

exports.generateToken = function() {
    return new Promise(function(resolve, reject) {
        crypto.randomBytes(7, function(ex, buf) {
            resolve({
                token: buf.toString('hex')
            });
        });
    });
};
