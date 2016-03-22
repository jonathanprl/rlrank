#!/usr/bin/env node

'use strict';

var app = require('./server/express.js');
require('./server/routes.js')(app);
require('./server/db.js');

var cron = require('./server/services/cron.js');
var CronJob = require('cron').CronJob;

var serverStatusCron = new CronJob('00 * * * * *',
  function()
  {
    cron.serverStatus();
  }, function(){}
);

var playersRanksCron = new CronJob('00 30 * * * *',
  function()
  {
    cron.playersRanks();
  }, function(){}
);

var playersStatsCron = new CronJob('00 00 * * * *',
  function()
  {
    cron.playersStats();
  }, function(){}
);

var leaderboardsCron = new CronJob('00 00 06 * * *',
  function()
  {
    cron.playersStats();
  }, function(){}
);

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
