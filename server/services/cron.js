var db = require('../db');
var psyonix = require('./psyonix');
var swiftping = require('../helpers/swiftping');
var ping = require('ping');

module.exports = {
  leaderboards,
  serverStatus,
  population,
  playersRanks
};

function leaderboards()
{
  var playlists = [10, 11, 12, 13];

  console.log('Updating leaderboards...'); // info

  playlists.forEach(
    function(playlist)
    {
      psyonix.getLeaderboard(playlist, function(err, results)
      {
        if (err)
        {
          console.log('Could not fetch leaderboard from Psyonix -', playlist, err); // error
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
              mmr: parseFloat(swiftping.MMRToSkillRating(result.MMR)),
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
                console.log('Updated leaderboard from Psyonix -', playlist); // info
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
  console.log('[CRON] Updating server statuses...'); // info

  psyonix.getServers(function(err, results)
  {
    if (err)
    {
      console.log('[CRON] [ERROR] Could not fetch server status from Psyonix', err); // error
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
                if (err) console.log('[CRON] [ERROR] Could not update DB with server statuses', err); // ERROR
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
  console.log('[CRON] Updating population...'); // info

  psyonix.getPopulation(function(err, playlists)
  {
    if (err)
    {
      return swiftping.apiResponse('error', res, err);
    }

    playlists.forEach(
      function(playlist)
      {
        db.upsert('population', {playlist: parseInt(playlist.PlaylistID)}, {playlist: parseInt(playlist.PlaylistID), players: parseInt(playlist.NumPlayers), created_at: new Date()},
          function(err, doc)
          {
            if (err) console.log('[CRON] [ERROR] Could not update DB with population', err); // ERROR
          }
        );
        db.insert('populationHistorical', {playlist: playlist.PlaylistID, players: parseInt(playlist.NumPlayers), created_at: new Date()},
          function(err, doc)
          {
            if (err) console.log('[CRON] [ERROR] Could not insert DB with population (historical)', err); // ERROR
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

function playersRanks()
{
  console.log('[CRON] Updating player ranks...'); // info

  db.findWhere('profiles', {platform: 'steam'},
    function(err, docs)
    {
      var profiles = docs;

      var batches = [];
      var batch = 200;
      var currentBatch = [];

      profiles.forEach(
        function(profile, index)
        {
          currentBatch.push(profile);
          // currentBatch.push(swiftping.decryptHash(profile.hash));

          if ((index + 1) % batch === 0 || (index + 1 == docs.length && (index + 1) % batch !== 0))
          {
            batches.push(currentBatch);
            currentBatch = [];
          }
        }
      );

      batches.forEach(
        function(profiles, batchindex)
        {
          setTimeout(
            function()
            {
              psyonix.getPlayersRanks(profiles, 'steam',
                function(err, players)
                {
                  players.forEach(
                    function(results, playerIndex)
                    {
                      var ranks = [];

                      results.forEach(
                        function(result)
                        {
                          if (result.Playlist === '0')
                          {
                            result.MMR = (result.Mu - (3 * result.Sigma)).toFixed(4);
                          }

                          var data = {
                            created_at: new Date(),
                            rlrank_id: profiles[playerIndex].rlrank_id, ranks are not aligning with profiles
                            playlist: result.Playlist,
                            mu: result.Mu,
                            sigma: result.Sigma,
                            tier: result.Tier,
                            division: result.Division,
                            matches_played: result.MatchesPlayed,
                            mmr: parseFloat(swiftping.MMRToSkillRating(result.MMR))
                          };
                          console.log(data);
                          ranks.push(data);

                          db.upsert('ranks', {rlrank_id: profiles[playerIndex].rlrank_id}, data,
                            function(err, doc)
                            {
                              if (err)
                              {
                                console.log('[RANKS] Could not save player rank to DB', rank, err); // ERROR
                              }
                            }
                          );
                        }
                      );
                    }
                  );
                }
              );
            }, String(batchindex*2000)
          );
        }
      );
    }
  );
}
