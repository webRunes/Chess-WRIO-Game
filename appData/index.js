var utils = require('./utils');

var appData = {};

utils.getAppData()
	.then(function(data) {
		appData = data || {};
	})
	.catch(function(err) {
		console.log('App data:', err.message);
	});

setInterval(function() {
	utils.sendAppData(appData);
}, 15 * 60 * 1000); // 15 minutes

exports.getSinceId = function() {
	return appData.sinceId ? appData.sinceId : 1;
};

exports.setSinceId = function(sinceId) {
	appData.sinceId = sinceId;
};
