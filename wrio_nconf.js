var nconf = require('nconf');
var path = require('path');
var fs = require('fs');

nconf.env().argv();
nconf.file({file:'./config.json'});

var defaultUrl = 'http://titter' + nconf.get('db:workdomain') ;
nconf.defaults({
    api: {
        titterUrl: defaultUrl
    }
});

module.exports = nconf;