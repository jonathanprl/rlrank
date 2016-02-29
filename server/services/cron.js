var db = require('../db');
var psyonix = require('./psyonix');
var ping = require('ping');

module.exports = {
  leaderboards,
  serverStatus,
  population
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

        var filteredResults = [];

        results.forEach(
          function(result, index)
          {
            filteredResults[index] = {
              position: index + 1,
              username: result.UserName,
              mmr: result.MMR,
              tier: result.Value,
              platform: result.Platform,
              steamid: result.SteamID
            };
          }
        );

        db.upsert('leaderboards', {playlist: playlist}, {playlist: playlist, leaderboard: filteredResults},
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
                console.log("Updated server status from Psyonix -", region); // info
              }
            );
          }
        );
      }
    );
  });
}

function population()
{
  console.log("Updating population..."); // info

  psyonix.getPopulation(function(err, playlists)
  {
    if (err)
    {
      return swiftping.apiResponse('error', res, err);
    }

    playlists.forEach(
      function(playlist)
      {
        db.upsert('population', {playlist: playlist.PlaylistID}, {playlist: playlist.PlaylistID, players: playlist.NumPlayers},
          function(err, doc)
          {
            console.log("Updated population from Psyonix", playlist); // info
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
