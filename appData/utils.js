var nconf = require('../wrio_nconf.js');
var mysql = require('mysql');
var Promise = require('es6-promise').Promise;

var APP_NAME = "Chess-WRIO-Game"

var connection = mysql.createConnection({
	host: nconf.get('db:host'),
	database: nconf.get('db:dbname'),
	user: nconf.get('db:user'),
	password: nconf.get('db:password')
});

connection.connect();

exports.sendAppData = function(data) {
	var stringData = JSON.stringify(data);
	var escapedDataString = connection.escape(stringData);
	
	var query = 'INSERT INTO webRunes_AppData (appName, data) VALUES ("' + APP_NAME + '", ' 
			+ escapedDataString + ') ON DUPLICATE KEY UPDATE data = ' + escapedDataString + ';';
			
	connection.query(query, stringData, function(err, result) {
	  	if (err) { 
	  		return console.log(err.message);
	  	}
	
	  	console.log('App data:', 'Application data have been sent to database');
	});
};

exports.getAppData = function() {
    return new Promise(function(resolve, reject) {
        var query = 'SELECT data FROM webRunes_AppData WHERE appName = "' + APP_NAME + '";';
    	connection.query(query, function(err, results) {
    		if (err) {
    			return reject(err);
    		}
    		
    		if (results.length == 0) {
    		    return reject(new Error('App data is not found'));
    		}
    		
    		resolve(JSON.parse(results[0].data));
    	});
    });
};