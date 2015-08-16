var nconf = require('../wrio_nconf.js');
var mysql = require('mysql');

var APP_NAME = "Chess-WRIO-Game"

function handleDisconnect() {
	connection = mysql.createConnection({
		host: nconf.get('db:host'),
		database: nconf.get('db:dbname'),
		user: nconf.get('db:user'),
		password: nconf.get('db:password')
	});

	connection.connect(function(err) { // The server is either down
		if (err) { // or restarting (takes a while sometimes).
			console.log('error when connecting to db:', err);
			setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
		} else {
			console.log("Connecting to db...")
			connection.query('USE ' + nconf.get('db:dbname'));
		} // to avoid a hot loop, and to allow our node script to
	}); // process asynchronous requests in the meantime.
	// If you're also serving http, display a 503 error.
	connection.on('error', function(err) {
		console.log('db error', err);
		if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
			handleDisconnect(); // lost due to either server restart, or a
		} else { // connnection idle timeout (the wait_timeout
			throw err; // server variable configures this)
		}
	});
}

handleDisconnect();

exports.sendAppData = function(data) {
	var stringData = JSON.stringify(data);
	var escapedDataString = connection.escape(stringData);

	var query = 'INSERT INTO webRunes_AppData (appName, data) VALUES ("' + APP_NAME + '", ' + escapedDataString + ') ON DUPLICATE KEY UPDATE data = ' + escapedDataString + ';';

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

			if (results.length === 0) {
				return reject(new Error('App data is not found'));
			}

			resolve(JSON.parse(results[0].data));
		});

	});
};
