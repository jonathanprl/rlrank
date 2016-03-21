#!/usr/bin/env node

'use strict';

var app = require('./server/express.js');
require('./server/routes.js')(app);
require('./server/db.js');

var cron = require('./server/services/cron.js');
cron.playersRanks();
(function() {
  // setInterval(
  //   function()
  //   {
  //     cron.serverStatus();
  //   },
  //   '60000' // Minutely
  // );
  //
  // setInterval(
  //   function()
  //   {
  //     cron.population();
  //   },
  //   '600000' // Hourly
  // );
  //
  // setInterval(
  //   function()
  //   {
  //     cron.leaderboards();
  //   },
  //   '3600000' // Daily
  // );
  //
  // setInterval(
  //   function()
  //   {
  //     cron.playersRanks();
  //   },
  //   '600000' // Hourly
  // );
}());
