var db = require('../db');
var profile = require('../controllers/profile');
var leaderboard = require('../controllers/leaderboard');
var psyonix = require('./psyonix');
var swiftping = require('../helpers/swiftping');
var ping = require('ping');
var Promise = require('bluebird');
var _ = require('lodash');

module.exports = {
  generateLeaderboards,
  leaderboards,
  serverStatus,
  serverList,
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

function generateLeaderboards()
{
  leaderboard.generateLeaderboards();
}

function leaderboards()
{
  swiftping.logger('info', 'cron', 'Updating leaderboards.');

  psyonix.getLeaderboards(function(err, playlists)
  {
    if (err)
    {
      return swiftping.logger('error', 'cron', 'Could not fetch leaderboards from Psyonix', err);
    }
    var filteredResultsPromises = [];

    var playlistIndex = 10;
    var leaderIndex = 0;

    delete playlists[0];
    delete playlists[2];
    delete playlists[4];
    delete playlists[6];

    var leaderboard = [];
    playlists.forEach(function(leaders, index) {
      leaders.map(function(leader) {
        leader.playlist = ((index - 1) / 2) + 10;
        leaderboard.push(leader);
      });
    });

    leaderboard.forEach(function(leader, index) {
      var input = leader.Platform == 'Steam' ? _.clone(leader.SteamID) : _.clone(leader.UserName).toLowerCase();
      var platform = _.clone(leader.Platform).toLowerCase();

      setTimeout(function() {
        profile.getProfileByInput(input, platform, function(err, rlProfile) {
          if (err)
          {
            swiftping.logger('critical', 'cron_leaderboard', 'Error getting profile for leaderboard player.', {input: input, platform: platform});
          }
          else
          {
            var leaderboardEntry = {
              username: leader.UserName,
              mmr: parseFloat(swiftping.MMRToSkillRating(leader.MMR)),
              tier: leader.Value,
              platform: leader.Platform,
              rlrank_id: rlProfile.rlrank_id,
              playlist: leader.playlist,
              season: 3
            };

            db.upsert('leaderboards', {playlist: leaderboardEntry.playlist, rlrank_id: leaderboardEntry.rlrank_id, season: leaderboardEntry.season}, leaderboardEntry,
              function(err, doc)
              {
                if (doc.upserted)
                {
                  swiftping.logger('critical', 'cron_leaderboard', 'New leaderboard entry "' + leaderboardEntry.username + '"', leaderboardEntry);
                }
              }
            );
          }
        });
      }, 2000 * index);
    });
  });
}

function serverList()
{
  psyonix.getServers(function(err, servers) {
    servers.forEach(function(server) {
      if ('Region' in server && 'IP' in server)
      {
        db.upsert('status', {region: server.Region}, {region: server.Region, host: server.IP},function(err, doc) {
          if (err)
          {
            swiftping.logger('error', 'cron', 'Could not update DB with Psyonix server details.', {mongoError: err});
          }
        });
      }
    });
  });
}

function serverStatus()
{
  swiftping.logger('info', 'cron', 'Updating server statuses...');

  db.find('status',
    function(err, docs)
    {
      if (docs.length == 0)
      {
        return false;
      }

      docs.forEach(function(server) {
        ping.promise.probe(server.host.split(':')[0])
          .then(function (res) {
            var ping = 0;

            if (res.alive)
            {
              if (res.output.indexOf('Average = ') > -1)
              {
                // Windows
                ping = res.output.split('Average = ')[1].split('ms')[0];
              }
              else if (res.output.indexOf('time=') > -1)
              {
                // Linux
                ping = res.output.split('time=')[1].split(' ms')[0];
              }
            }

            db.update('status', {region: server.region }, {$set: { online: res.alive, ping: parseFloat(ping), updatedAt: new Date() } },
              function(err, doc)
              {
                if (ping > 500)
                {
                  swiftping.logger('info', 'cron', 'Server host has high ping.', res);
                }
              }
            );
          });
      });
    }
  );
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
