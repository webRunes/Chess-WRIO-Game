var utils = require('./utils');

var appData = {};
var db;

exports.init = function(args, cb) {
	db = args.db || {};
	var cb = cb || function() {};
	utils.init({
		db: db
	}, function() {
		utils.getAppData()
			.then(function(data) {
				appData = data || {};
				cb();
			})
			.catch(function(err) {
				cb(err);
				console.log('App data:', err.message);
			});
	});
}

setInterval(function() {
	utils.sendAppData(appData);
}, 15 * 60 * 1000); // 15 minutes

exports.getSinceId = function() {
	return appData.sinceId ? appData.sinceId : 1;
};

exports.setSinceId = function(sinceId) {
	appData.sinceId = sinceId;
};
