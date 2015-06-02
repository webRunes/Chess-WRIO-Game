var Titter = require('./titter');

setInterval(function() {
	Titter.searchAndReply();
}, 10000);
