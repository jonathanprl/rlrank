'use strict';

var app = require('./server/express.js');
require('./server/routes.js')(app);
require('./server/db.js');

var cron = require('./server/services/cron.js');

(function() {
  setInterval(
    function()
    {
      console.log("Updating leaderboards..."); // INFO
      cron.hourlyLeaderboards();
    },
    '3600000'
  );
}());
