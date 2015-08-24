var nconf = require('../wrio_nconf.js');
var MongoClient = require('mongodb')
	.MongoClient;

var url = 'mongodb://' + nconf.get('mongo:user') + ':' + nconf.get('mongo:password') + '@' + nconf.get('mongo:host') + '/' + nconf.get('mongo:dbname');
MongoClient.connect(url, function(err, db) {
	if (err) {
		console.log("Error conecting to mongo database: " + err);
	} else {
		console.log("Connected correctly to mongodb server");
		dbConnected(db);
	}
});

var db;
var webrunes_AppData;

function dbConnected(db_link) {
	db = db_link;
	webRunes_AppData = db.collection('webRunes_AppData');
}

exports.sendAppData = function(data) {
	var stringData = JSON.stringify(data);
	var escapedDataString = connection.escape(stringData);
	var obj = {
		appName: APP_NAME,
		data: escapedDataString
	};
	//var query = 'INSERT INTO webRunes_AppData (appName, data) VALUES ("' + APP_NAME + '", ' + escapedDataString + ') ON DUPLICATE KEY UPDATE data = ' + escapedDataString + ';';
	webRunes_AppData.updateOne(obj, {
		upsert: true
	}, function(err, result) {
		//		connection.query(query, stringData, function (err, result) {
		if (err) {
			return console.log(err.message);
		}

		console.log('App data:', 'Application data have been sent to database');
	});

};

exports.getAppData = function() {
	return new Promise(function(resolve, reject) {
		//var query = 'SELECT data FROM webRunes_AppData WHERE appName = "' + APP_NAME + '";';
		webRunes_AppData.findOne({
			appName: APP_NAME
		})
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
