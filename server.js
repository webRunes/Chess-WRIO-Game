var express = require('express');
var app = require("./wrio_app.js").init(express);
var server = require('http').createServer(app).listen(3000);

var nconf = require("./wrio_nconf.js").init();
var Twit = require('twit');
var async = require('async');

// app.use(express.static(__dirname + '/public'));

var twconf = {
	consumer_key: nconf.get("api:twitterLogin:consumerKey"),
	consumer_secret: nconf.get("api:twitterLogin:consumerSecret"),
	access_token: nconf.get("api:twitterLogin:access_token"),
	access_token_secret: nconf.get("api:twitterLogin:access_token_secret")
};
console.log(twconf);
var T = new Twit(twconf);

var last = 1;
var dateTime = new Date();
var queue = [];
var idTwit = [];

async.series([

// ==========================
// Search messages
// ==========================

	function(callback){
		console.log('after');
		setInterval(function (){

				T.get('search/tweets', {
					q: '#chess start since:' + dateTime.getFullYear()+ 
					'-' + (dateTime.getMonth()+1) + '-' + dateTime.getDate(),
					since_id: last
				}, function(err, item) {
					if (!item.statuses[0]) {
					last = 1;
				} else{
					last = item.statuses[0].id
				}

				async.series([
					function(callback){
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
						callback(null, 'two');
				},

				// ==========================
				// writeResult
				// ==========================
				function (callback) {
					setInterval(function (){
						console.log(queue.length);
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

								// resp.write(JSON.stringify(data));
								queue = undefined;
								queue=[];
							});
						};

					callback(null, 'two');
					queue = undefined;
					queue=[];

						},10000);
				}
				],
				function(err, results){
				    // results is now equal to ['one', 'two']
				})
				}
			);
	//	queue = undefined;
	//queue=[];
		},10000);
	callback(null, 'two');
}
],
function(err, results){
    // results is now equal to ['one', 'two']
});
