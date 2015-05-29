var nconf = require('./wrio_nconf.js');
var moment = require('moment');
var _ = require('lodash');
var bigInt = require("big-integer");

var Titter = require('./titter');

var START_CHESS_QUERY = '"%23chess start" OR "start %23chess" since:' 
		+ moment().format('YYYY-MM-DD');

var query = {
	q: START_CHESS_QUERY,
	since_id: '1'
};

setInterval(function() {
	Titter.search(query)
		.then(function(statuses) {
			console.log('Found ', statuses.length, 'statuses');

			var lastStatus = _.max(statuses, function(status) {
				return bigInt(status.id_str);
			});
			
			query.since_id = lastStatus.id_str;
			
			return statuses;
		})
		.then(Titter.reply)
		.then(function(body) {
			console.log(body);
		})
		.catch(function(error) {
			console.log(error.message);
		})
}, 10000);