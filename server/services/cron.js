var db = require('../db');
var psyonix = require('./psyonix');
var ping = require('ping');

module.exports = {
  leaderboards,
  serverStatus
};

function leaderboards()
{
  var playlists = [10, 11, 12, 13];


  console.log("Updating leaderboards..."); // info

  playlists.forEach(
    function(playlist)
    {
      psyonix.getLeaderboard(playlist, function(err, results)
      {
        if (err)
        {
          console.log("Could not fetch leaderboard from Psyonix -", playlist, err); // error
        }

        db.upsert('leaderboards', {playlist: playlist}, {playlist: playlist, leaderboard: results},
          function(err, doc)
          {
            console.log("Updated leaderboard from Psyonix -", playlist); // info
          }
        );
      });
    }
  );
}

function serverStatus()
{
  console.log("Updating server statuses..."); // info

  psyonix.getServers(function(err, results)
  {
    if (err)
    {
      console.log("Could not fetch server status from Psyonix", err); // error
    }

    _pingRegions(results,
      function(regions)
      {
        regions.forEach(
          function(region)
          {
            db.upsert('status', {region: region.name}, {region: region.name, online: region.online},
              function(err, doc)
              {
                console.log("Updated server status from Psyonix", region); // info
              }
            );
          }
        );
      }
    );
  });
}

function _pingRegions(regions, callback)
{
  var promises = [];

  regions.forEach(
    function(region)
    {
      var ip = region.IP.split(':')[0];

      promises.push(new Promise(
        function (resolve, reject)
        {
          ping.sys.probe(ip,
            function(isAlive)
            {
              resolve({name: region.Region, online: isAlive});
            }
          );
        }
      ));
    }
  );

  Promise.all(promises)
    .then(function(results)
    {
      callback(results);
    }
  );
}
