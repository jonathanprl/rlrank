#!/usr/bin/env node

'use strict';

var app = require('./server/express.js');
require('./server/routes.js')(app);
require('./server/db.js');

var cron = require('./server/services/cron.js');
var CronJob = require('cron').CronJob;

new CronJob('00 * * * * *',
  function()
  {
    console.log('[CRON] Running serverStatus cronjob...', (new Date()).toTimeString());
    cron.serverStatus();
  }, function(){}, true
);

new CronJob('00 30 * * * *',
  function()
  {
    console.log('[CRON] Running playersRanks cronjob...', (new Date()).toTimeString());
    cron.playersRanks();
  }, function(){}, true
);

new CronJob('00 00 * * * *',
  function()
  {
    console.log('[CRON] Running playersStats cronjob...', (new Date()).toTimeString());
    cron.playersStats();
  }, function(){}, true
);

new CronJob('00 00 06 * * *',
  function()
  {
    console.log('[CRON] Running leaderboards cronjob...', (new Date()).toTimeString());
    cron.leaderboards();
  }, function(){}, true
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
