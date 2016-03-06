#!/usr/bin/env node

'use strict';

var app = require('./server/express.js');
require('./server/routes.js')(app);
require('./server/db.js');

var cron = require('./server/services/cron.js');

(function() {
  setInterval(
    function()
    {
      cron.serverStatus();
    },
    '60000'
  );

  setInterval(
    function()
    {
      cron.population();
    },
    '300000'
  );

  setInterval(
    function()
    {
      cron.leaderboards();
    },
    '3600000'
  );
}());
