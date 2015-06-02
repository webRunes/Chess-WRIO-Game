var moment = require('moment');
var _ = require('lodash');
var bigInt = require("big-integer");

var TitterClient = require('./titterClient');
var appData = require('../appData');

var START_CHESS_QUERY = '"%23chess start" OR "start %23chess" since:' 
		+ moment().format('YYYY-MM-DD');

exports.searchAndReply = function() {
    var query = {
    	q: START_CHESS_QUERY,
    	since_id: appData.getSinceId()
    };
    
    TitterClient.search(query)
    	.then(function(statuses) {
    		var userNames = statuses.map(function(status) {
    			return status.user.screen_name;	
    		});
    		
    		console.log('Titter:', 'Found', statuses.length, 'statuses from:', userNames.join(', '));
    		
    		var lastStatus = _.max(statuses, function(status) {
    			return bigInt(status.id_str);
    		});
    		
    		appData.setSinceId(lastStatus.id_str);
    		
    		return statuses;
    	})
    	.then(TitterClient.reply)
    	.then(function(body) {
    		console.log('Titter:', body);
    	})
    	.catch(function(error) {
    		console.log('Titter:', error.message);
    	});
};