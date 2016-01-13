var nconf = require('../wrio_nconf.js'),
    MongoClient = require('mongodb')
    .MongoClient,

    APP_NAME = 'chess',
    db,
    webRunes_AppData;

exports.init = function(args, cb) {
    var cb = cb || function() {},
        args = args || {},
        db = args.db || {};
    dbConnected(args.db)
    cb();
}

function dbConnected(db_link) {
    db = db_link;
    webRunes_AppData = db.collection('webRunes_AppData');
}

exports.sendAppData = function(data) {
    //var query = 'INSERT INTO webRunes_AppData (appName, data) VALUES ("' + APP_NAME + '", ' + escapedDataString + ') ON DUPLICATE KEY UPDATE data = ' + escapedDataString + ';';
    webRunes_AppData.update({
        appName: APP_NAME
    }, {
        $set: {
            data: data
        }
    }, function(err, result) {
        //		connection.query(query, stringData, function (err, result) {
        if (err) {
            return console.log(err.message);
        } else if (result.result.n === 0) {
            webRunes_AppData.insert({
                appName: APP_NAME,
                data: data
            }, function(err, res) {
                if (err) {
                    return console.log(err.message);
                } else {
                    return console.log('App data:', 'Application data has been sent');
                }
            });
        } else {
            return console.log('App data:', 'Application data has been sent');
        }

    });

};

exports.getAppData = function() {
    return new Promise(function(resolve, reject) {
        //var query = 'SELECT data FROM webRunes_AppData WHERE appName = "' + APP_NAME + '";';
        webRunes_AppData.find({
                appName: APP_NAME
            })
            .toArray(function(err, results) {
                if (err) {
                    return reject(err);
                } else

                if (results.length === 0) {
                    console.log('App data not found');
                    resolve();
                } else {
                    console.log('App data:', 'Application data loaded')
                    resolve(results[0].data);
                }

            });

    });
};
