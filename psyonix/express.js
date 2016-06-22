'use strict';

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var config = require('./config');

app.use(bodyParser.json());
app.enable('trust proxy');
app.listen(config.port);

console.log('Psyonix server started on port ' + config.port);

module.exports = app;
