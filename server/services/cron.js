var db = require('../db');
var psyonix = require('./psyonix');
var swiftping = require('../helpers/swiftping');
var ping = require('ping');

module.exports = {
  leaderboards,
  serverStatus,
  population,
  playersRanks,
  playersStats,
  refreshToken
};

function refreshToken()
{
  psyonix.refreshToken(function(err, token) {
    console.log(err);
    console.log(token);
  });
}

function leaderboards()
{
  console.log('Updating leaderboards...'); // info

  psyonix.getLeaderboards(function(err, playlists)
  {
    if (err)
    {
      console.log('Could not fetch leaderboard from Psyonix -', playlist, err); // error
    }
    var playlistIndex = 10;

    playlists.forEach(
      function(playlist, index)
      {
        var filteredResults = [];

        if (playlist.length > 0)
        {
          playlist.forEach(
            function(result, index)
            {
              filteredResults.push({
                username: result.UserName,
                mmr: parseFloat(swiftping.MMRToSkillRating(result.MMR)),
                tier: result.Value,
                platform: result.Platform,
                rlrank_id: result.Platform == 'Steam' ? result.SteamID : result.UserName
              });
            }
          );

          db.upsert('leaderboards', {playlist: playlistIndex}, {playlist: playlistIndex, leaderboard: filteredResults},
            function(err, doc)
            {
              console.log('Updated leaderboard from Psyonix'); // info
            }
          );

          playlistIndex++;
        }
      }
    );
  });
}

function serverStatus()
{
  console.log('[CRON] Updating server statuses...'); // info

  db.find('status',
    function(err, doc)
    {
      var servers = doc[0];
      if (doc.length > 0)
      {
        doc.forEach(
          function(server)
          {
            if ('host' in server)
            {
              var ip = server.host.split(':')[0];

              ping.sys.probe(ip,
                function(isAlive)
                {
                  db.update('status', {region: server.region}, {$set: { online: isAlive ? true : false } },
                    function(err, doc)
                    {
                      if (!isAlive)
                        console.log("[CRON] %s is offline", server.region);
                    }
                  );
                }
              );
            }
          }
        );
      }
      else
      {
        psyonix.getServers(
          function(err, servers)
          {
            servers.forEach(
              function(server)
              {
                if ('Region' in server && 'IP' in server)
                {
                  db.upsert('status', {region: server.Region}, {region: server.Region, host: server.IP},
                    function(err, doc)
                    {
                      if (err)
                      {
                        console.log('[CRON] [ERROR] Could not update DB with Psyonix server details', err); // ERROR
                      }
                    }
                  );
                }
              }
            );
          }
        )
      }
    }
  );
  //
  // psyonix.getServers(function(err, results)
  // {
  //   if (err)
  //   {
  //     console.log('[CRON] [ERROR] Could not fetch server status from Psyonix', err); // error
  //   }
  // });
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

function playersStats()
{
  console.log("[CRON] Getting players stats from Psyonix");

  var stats = ['Wins', 'Goals', 'MVPs', 'Saves', 'Shots', 'Assists'];

  db.find('profiles',
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
          stats.forEach(
            function(stat, statIndex)
            {
              setTimeout(
                function()
                {
                  psyonix.getPlayersStat(profiles, stat,
                    function(err, players)
                    {
                      players.forEach(
                        function(player, playerIndex)
                        {
                          var stat = player[0];

                          if (stat)
                          {
                            var data = {
                              created_at: new Date(),
                              rlrank_id: profiles[playerIndex].rlrank_id,
                              type: stat.LeaderboardID,
                              value: stat.Value
                            };

                            var query = {
                              rlrank_id: data.rlrank_id,
                              type: data.type
                            };

                            db.upsert('stats', query, data,
                              function(err, doc)
                              {
                                if (err)
                                {
                                  console.log("[CRON] Could not save player stats to DB", query, data, err); // ERROR
                                }
                              }
                            );

                            db.insert('statsHistorical', data,
                              function(err, doc)
                              {
                                if (err)
                                {
                                  console.log("[CRON] Could not save player stats to DB", query, data, err); // ERROR
                                }
                              }
                            );
                          }
                        }
                      );
                    }
                  );
                }, String(batchindex * 10000)
              );
            }
          );
        }
      );

    }
  );
}

function playersRanks()
{
  console.log('[CRON] Updating player ranks...'); // info

  db.findWhere('profiles',
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
              psyonix.getPlayersRanks(profiles,
                function(err, players)
                {
                  if (players.length != profiles.length)
                  {
                    console.log('[CRON] [ERROR] No. of player ranks retrieved from Psyonix do not match no. of profiles in DB');
                    return false;
                  }

                  players.forEach(
                    function(results, playerIndex)
                    {
                      results.forEach(
                        function(result)
                        {
                          if (result.Playlist === '0')
                          {
                            result.MMR = (result.Mu - (3 * result.Sigma)).toFixed(4);
                          }

                          var data = {
                            created_at: new Date(),
                            rlrank_id: profiles[playerIndex].rlrank_id,
                            playlist: parseInt(result.Playlist),
                            mu: result.Mu,
                            sigma: result.Sigma,
                            tier: parseInt(result.Tier),
                            division: parseInt(result.Division),
                            matches_played: parseInt(result.MatchesPlayed),
                            mmr: parseFloat(swiftping.MMRToSkillRating(result.MMR))
                          };

                          var query = {
                            rlrank_id: data.rlrank_id,
                            playlist: data.playlist
                          }

                          db.upsert('ranks', query, data,
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
            }, String(batchindex * 10000)
          );
        }
      );
    }
  );
}
