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
    console.log(toTimeString() + ' [CRON] Running serverStatus cronjob...');
    cron.serverStatus();
  }, function(){}
);

var playersRanksCron = new CronJob('00 30 * * * *',
  function()
  {
    console.log(toTimeString() + ' [CRON] Running playersRanks cronjob...');
    cron.playersRanks();
  }, function(){}
);

var playersStatsCron = new CronJob('00 00 * * * *',
  function()
  {
    console.log(toTimeString() + ' [CRON] Running playersStats cronjob...');
    cron.playersStats();
  }, function(){}
);

var leaderboardsCron = new CronJob('00 00 06 * * *',
  function()
  {
    var time = new Date();
    console.log(toTimeString() + ' [CRON] Running leaderboards cronjob...');
    cron.leaderboards();
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
