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

        var leadersSteam = [];
        var leadersPSN = [];
        var leaders = [];

        var filteredResults = [];

        results.forEach(
          function(result, index)
          {
            filteredResults.push({
              username: result.UserName,
              mmr: parseFloat(result.MMR),
              tier: result.Value,
              platform: result.Platform,
              rlrank_id: result.Platform == 'Steam' ? result.SteamID : result.UserName
            });
            // if (result.Platform == 'Steam')
            // {
            //   leadersSteam.push(result.SteamID);
            // }
            // else
            // {
            //   leadersPSN.push(result.UserName);
            // }
            //
            // if ('Value' in result)
            // {
            //   leaders.push({
            //     username: result.UserName,
            //     mmr: parseFloat(result.MMR),
            //     tier: result.Value,
            //     platform: result.Platform,
            //     rlrank_id: result.Platform == 'Steam' ? result.SteamID : result.UserName
            //   });
            // }
          }
        );
        console.log(filteredResults);

        // var promises = [];
        //
        // promises.push(new Promise(
        //   function (resolve, reject)
        //   {
        //     psyonix.getPlayerRatingSteam(leadersSteam[0], playlist,
        //       function(err, ratings)
        //       {
        //         console.log(leadersSteam[0]);
        //         console.log(ratings);
        //         resolve(ratings);
        //       }
        //     );
        //   }
        // ));
        //
        // promises.push(new Promise(
        //   function (resolve, reject)
        //   {
        //     psyonix.getLeaderboardRatingsPSN(leadersPSN, playlist,
        //       function(err, ratings)
        //       {
        //         resolve(ratings);
        //       }
        //     );
        //   }
        // ));

        // Promise.all(promises)
        //   .then(function(ratings)
        //   {
        //     ratings = ratings[0].concat(ratings[1]);
        //
        //     ratings.forEach(
        //       function(rating, index)
        //       {
        //         leaders.forEach(
        //           function(leader)
        //           {
        //             if ('SteamID' in rating && rating.SteamID == leader.rlrank_id)
        //             {
        //               leader.rating = rating.Value;
        //             }
        //             else if(rating.UserName == leader.rlrank_id)
        //             {
        //               leader.rating = rating.Value;
        //             }
        //           }
        //         )
        //       }
        //     );

            db.upsert('leaderboards', {playlist: playlist}, {playlist: playlist, leaderboard: filteredResults},
              function(err, doc)
              {
                console.log("Updated leaderboard from Psyonix -", playlist); // info
              }
            );
        //   }
        // );
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
