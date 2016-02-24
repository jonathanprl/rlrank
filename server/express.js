'use strict';

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var env = process.env.ENV || 'dev';
var config = require('../config');
var path = require('path');

app.set('views', path.normalize(__dirname + '/../public/app'));
app.set('view engine', 'jade');
app.use(bodyParser.json())
app.use(express.static(path.normalize(__dirname + '/../public')));

var server = app.listen(config.port);
console.log('Listening on port %s...', config.port);

module.exports = app;
