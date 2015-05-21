var express = require('express');
var app = require("./wrio_app.js").init(express);
app.listen(3000);

var nconf = require("./wrio_nconf.js").init();
var Twit = require('twit');
var async = require('async');

var moment = require('moment');

var twconf = {
	consumer_key: nconf.get("api:twitterLogin:consumerKey"),
	consumer_secret: nconf.get("api:twitterLogin:consumerSecret"),
	access_token: nconf.get("api:twitterLogin:access_token"),
	access_token_secret: nconf.get("api:twitterLogin:access_token_secret")
};

console.log(twconf);
var T = new Twit(twconf);

var START_CHESS_QUERY = '"%23chess start" OR "start %23chess" since:' 
		+ moment().format('YYYY-MM-DD');
var last = 1;

setInterval(function() {
	T.get('search/tweets',  {
		q: START_CHESS_QUERY,
		since_id: last
	}, function(err, item) {
		console.log("Searching from last ", last, "got ", item.statuses.length);
		if (item.statuses.length > 0) {
				for (var i = 0; i < item.statuses.length; i++) {
					console.log ("Got id",item.statuses[i].id );
					if (item.statuses[i].id > last) {
						last = item.statuses[i].id.toString();
						console.log("===Remembering last ",last);
					}
				}
		}

		async.waterfall([
			function(callback){
				var queue = [];

				for (var i = 0; i < item.statuses.length; i++){

					var textMessageUser = item.statuses[i].text;

					console.log("Got tweet from", item.statuses[i].user.screen_name);
					var regExpFind = /.*[\s#chess\s|\sstart\s]/;
					var messageForUs = textMessageUser.match(regExpFind);

					if (messageForUs) {
						console.log("Message 4 us");
						var reply = {
							textReply: '@' + item.statuses[i].user.screen_name +' Game started',
							statusIdStrReply: item.statuses[i].id_str,
							screenName: item.statuses[i].user.screen_name
						};

						queue.push(reply);
					}
				}
				callback(null, queue);
			},

			// ==========================
			// writeResult
			// ==========================
			function (queue, callback) {
				for(var i = 0; i<queue.length;i++){
					T.post('statuses/update', {
						status: queue[i].textReply,
						screen_name: queue[i].screenName,
						in_reply_to_status_id: queue[i].statusIdStrReply
					}, function (err,data,res){
						if (err) {
							console.log("Tweet send error ",err);
							return;
						}
						console.log(data);
					});
				};
				callback(null, 'two');
			}
		]);
		}
	);
},10000);
