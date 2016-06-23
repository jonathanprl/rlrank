#!/usr/bin/env node

'use strict';

var app = require('./server/express.js');
require('./server/routes.js')(app);
require('./server/db.js');

var cron = require('./server/services/cron.js');
var swiftping = require('./server/helpers/swiftping');
var config = require('./config');
var CronJob = require('cron').CronJob;

cron.serverStatus();
new CronJob('*/5 * * * *',
  function()
  {
    swiftping.logger('info', 'cron', 'Running serverStatus cronjob...', (new Date()).toTimeString());
    cron.serverStatus();
  }, function(){}, true
);

if (config.psyonix.bypass)
{
  return false;
}

new CronJob('30 1 * * *',
  function()
  {
    swiftping.logger('info', 'cron', 'Running serverList cronjob...', (new Date()).toTimeString());
    cron.serverList();
  }, function(){}, true
);
cron.refreshToken();
new CronJob('*/20 * * * *',
  function()
  {
    swiftping.logger('info', 'cron', 'Running token refresh cronjob...', (new Date()).toTimeString());
    cron.refreshToken();
  }, function(){}, true
);

// new CronJob('00 30 * * * *',
//   function()
//   {
//     console.log('[CRON] Running playersRanks cronjob...', (new Date()).toTimeString());
//     cron.playersRanks();
//   }, function(){}, true
// );

// new CronJob('00 00 * * * *',
//   function()
//   {
//     console.log('[CRON] Running playersStats cronjob...', (new Date()).toTimeString());
//     cron.playersStats();
//   }, function(){}, true
// );
//

new CronJob('0 */4 * * *',
  function()
  {
    console.log('[CRON] Running leaderboards cronjob...', (new Date()).toTimeString());
    cron.leaderboards();
  }, function(){}, true
);
