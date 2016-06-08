'use strict';

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var env = process.env.ENV || 'dev';
var config = require('../config');
var path = require('path');
var http = require('http');
var https = require('https');
var fs = require('fs');
var swiftping = require('./helpers/swiftping');
var discord = require('./services/discord');

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
  discord.start();
  http.createServer(function (req, res) {
    res.writeHead(301, { 'Location': 'https://' + req.headers['host'] + req.url });
    res.end();
  }).listen(config.port);

  var secureServer = https.createServer({
    key: fs.readFileSync(path.normalize(__dirname + '/keys/private.key')),
    cert: fs.readFileSync(path.normalize(__dirname + '/keys/rocketleaguerank.com.crt')),
    ca: [
      fs.readFileSync(path.normalize(__dirname + '/keys/1.crt')),
      fs.readFileSync(path.normalize(__dirname + '/keys/2.crt')),
      fs.readFileSync(path.normalize(__dirname + '/keys/3.crt'))
    ]
  }, app).listen(config.port + 5);
}

swiftping.logger('info', 'SERVER', 'Server has started.');

module.exports = app;
