'use strict';

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var env = process.env.ENV || 'dev';
var config = require('../config');
var path = require('path');
var https = require('https');
var fs = require('fs');

console.log(config.env);

app.set('views', path.normalize(__dirname + '/../public/app'));
app.set('view engine', 'jade');
// if (config.env == 'prod') app.use(require('express-sslify').HTTPS({ trustProtoHeader: true }));
app.use(require('prerender-node').set('prerenderToken', 'It894S0HIa5KY4kogyI2'));
app.use(bodyParser.json());
app.use(express.static(path.normalize(__dirname + '/../public')));

if (config.env == 'dev')
{
  app.listen(config.port);
}
else
{
  var secureServer = https.createServer({
    key: fs.readFileSync(path.normalize(__dirname + '/keys/private.key')),
    cert: fs.readFileSync(path.normalize(__dirname + '/keys/rocketleaguerank.com.ca-bundle'))
  }, app).listen(config.port);
}

console.log('Listening on port %s...', config.port);

module.exports = app;
