'use strict';

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var env = process.env.ENV || 'dev';
var config = require('../config');
var path = require('path');

app.set('views', path.normalize(__dirname + '/../public/app'));
app.set('view engine', 'jade');
app.use(bodyParser.json());
app.use(express.static(path.normalize(__dirname + '/../public')));

var server = app.listen(config.port);
console.log('Listening on port %s...', config.port);


var io = require('socket.io')(server);

app.io = io;

var sockets = [];
io.on('connection',
  function(socket)
  {
    sockets.push(socket.id);
    console.log('[SOCKET] Someone connected to socket.io. Total connections:', sockets.length);

    socket.on('disconnect',
      function()
      {
        sockets.splice(sockets.indexOf(socket.id), 1);
        console.log('[SOCKET] Someone disconnected from socket.io. Total connections:', sockets.length);
      }
    );
  }
);

module.exports = app;
