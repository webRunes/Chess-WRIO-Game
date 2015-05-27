var nconf = require('nconf');
var path = require('path');
var fs = require('fs');

nconf.env().argv();
nconf.file({file:'./config.json'});
nconf.set('database:host', '127.0.0.1');

module.exports = nconf;