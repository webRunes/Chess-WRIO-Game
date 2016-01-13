var nconf = require('nconf');
var path = require('path');
var fs = require('fs');

nconf.env()
    .argv();
nconf.file(path.resolve(__dirname, '../../config.json'));

var defaultUrl = 'http://titter' + nconf.get('db:workdomain');
nconf.defaults({
    api: {
        titterUrl: defaultUrl
    }
});

module.exports = nconf;
