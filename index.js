var express = require('express');
var cors = require('cors');
var app = express();
var redis = require("redis");
var client = redis.createClient();
var credentials = {
    accessKeyId: 'DYNAMODB_AMI_KEY',
    secretAccessKey: 'DYNAMODB_AMI_SECRET'
};
var dynasty = require('dynasty')(credentials),
	links = dynasty.table('umb-save');
var randomstring = require("randomstring");
var bodyParser = require('body-parser');

app.use(cors());
app.use(bodyParser());

app.get('/', function (req, res) {
	var term = String(req.query.term).trim().replace(/[^A-Za-z0-9 ]/, '').replace(' ', '').toUpperCase();
	client.zrangebylex('scheduler_s2017', '['+term, '['+term+'\xff', 'LIMIT', 0, 25, function (err, replies) {
		var answer = [];
		for (var i = 0; i < replies.length; i++) {
			var temp = replies[i].split('%');
			var hi = JSON.parse(temp[1]);
			for (var j = 0; j < hi.length; j++) {
				hi[j]['location'] = hi[j]['location'].replace('$', '').replace(',', ' ');
				var temp_spl = hi[j]['location'].split(' ');
				hi[j]['location'] = '';
				for (var z = 0; z < temp_spl.length; z++) {
					if (z >= 2) temp_spl[z] = temp_spl[z].charAt(0).toUpperCase();
					hi[j]['location'] += temp_spl[z] + ' ';
				}
				answer.push(hi[j]);
			}
		}
		res.status(200).type('json').send(JSON.stringify({result: answer}));
	});
})

app.get('/v2/', function (req, res) {
	var term = String(req.query.term).trim().replace(/[^A-Za-z0-9 ]/, '').replace(' ', '').toUpperCase();
	client.zrangebylex('scheduler_s2017_v2', '['+term, '['+term+'\xff', 'LIMIT', 0, 20, function (err, replies) {
		var answer = [];
		for (var i = 0; i < replies.length; i++) {
			var hi = JSON.parse(replies[i].split('%')[1]);
			for (var j = 0; j < hi.length; j++) {
				hi[j]['time'] = JSON.parse(hi[j]['time']);
				answer.push(hi[j]);
			}
		}
		res.status(200).type('json').send(JSON.stringify({result: answer}));
	});
})

app.get('/save/', function (req, res) {
	links
		.find({ hash: req.query.id })
		.then(function(data) {
			if (data) {
				delete data.data['id'];
				res.status(200).type('json').send(JSON.stringify(data));
			} else {
				res.send('nodata');
			}
		});
})

app.post('/savethis/', function (req, res) {
	checkID(req.body.data, res);
})

function checkID(newData, callback) {
	var rand = randomstring.generate({length: 6, readable: true, charset: 'alphanumeric'});
	links
		.find({ hash: rand })
		.then(function(rdata) {
			if (rdata) {
				checkID(newData, callback);
			} else {
				links
				    .insert({ id: rand, data: newData })
				    .then(function(resp) {
				        callback.send(rand);
				    })
				    .catch(function(err) {
				        callback.send('error');
				    });
			}
		});
}

app.listen(4000, function () {
  console.log('Example app listening on port 4000!')
})