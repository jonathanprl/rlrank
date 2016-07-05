var rest = require('restler');
var cheerio = require('cheerio');
var db = require('../db');
var swiftping = require('../helpers/swiftping');
var profile = require('./profile');
var psyonix = require('../services/psyonix');

module.exports = {
  getLeaderboards,
  generateLeaderboards
};

/**
 *
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
function getLeaderboards(req, res)
{
  db.aggregate('leaderboards', [ { $match: { season: parseInt(req.query.season) } }, { $group: {'_id': '$playlist', players: { $push: '$$ROOT' } } }, { $project: { _id: 0, players: 1, playlist: '$_id' } } ], function(err, docs) {
    if (err)
    {
      return swiftping.apiResponse('error', res, err);
    }

    return swiftping.apiResponse('ok', res, docs);
  });
}
/*
var leaderboards = [];
$('#DataTables_Table_0').dataTable().api().data().filter(function(entry) {
  return parseInt(entry[0]) <= 200;
}).map(function(entry) {
  leaderboards.push({
    input: $(entry[1]).attr('href').split('/')[3],
    platform: entry[2].split(' alt=\"\"> ')[1].toLowerCase().replace('ps4', 'psn').replace('xboxone', 'xbox'),
    mmr: entry[3],
    playlist: 10
  });
});
$('#DataTables_Table_1').dataTable().api().data().filter(function(entry) {
  return parseInt(entry[0]) <= 200;
}).map(function(entry) {
  leaderboards.push({
    input: $(entry[1]).attr('href').split('/')[3],
    platform: entry[2].split(' alt=\"\"> ')[1].toLowerCase().replace('ps4', 'psn').replace('xboxone', 'xbox'),
    mmr: entry[3],
    playlist: 11
  });
});
$('#DataTables_Table_2').dataTable().api().data().filter(function(entry) {
  return parseInt(entry[0]) <= 200;
}).map(function(entry) {
  leaderboards.push({
    input: $(entry[1]).attr('href').split('/')[3],
    platform: entry[2].split(' alt=\"\"> ')[1].toLowerCase().replace('ps4', 'psn').replace('xboxone', 'xbox'),
    mmr: entry[3],
    playlist: 12
  });
});
$('#DataTables_Table_3').dataTable().api().data().filter(function(entry) {
  return parseInt(entry[0]) <= 200;
}).map(function(entry) {
  leaderboards.push({
    input: $(entry[1]).attr('href').split('/')[3],
    platform: entry[2].split(' alt=\"\"> ')[1].toLowerCase().replace('ps4', 'psn').replace('xboxone', 'xbox'),
    mmr: entry[3],
    playlist: 13
  });
});
copy(leaderboards);
*/

function generateLeaderboards()
{
  rest.get('https://rocketleaguestats.com').on('complete', function(data) {
    var $ = cheerio.load(data);

    var playlists = [10, 11, 12, 13];
    var leaderboards = [];

    playlists.forEach(function(playlist) {
      $('#playlist_' + playlist + ' tbody tr').each(function(i,v) {
        if (i<200)
        {
          leaderboards.push({
            input: $(v).find('a').attr('href').split('/')[3],
            platform: $(v).children('td').eq(2).html().split(' alt=\"\"> ')[1].toLowerCase().replace('ps4', 'psn').replace('xboxone', 'xbox'),
            mmr: $(v).children('td').eq(3).text(),
            playlist: 10
          });
        }
      });
    });

    swiftping.logger('info', 'leaderboards', 'Getting new leaderboards from RLS. ' + leaderboards.length + ' entries.');

    leaderboards.forEach(function(leader, index) {
      var input = leader.input;
      var platform = leader.platform;

      setTimeout(function() {
        profile.getProfileByInput(input, platform, function(err, rlProfile) {
          if (err)
          {
            console.log(err);
            swiftping.logger('critical', 'cron_leaderboard', 'Error getting profile for leaderboard player.', {input: input, platform: platform});
          }
          else
          {
            var leaderboardEntry = {
              input: input,
              username: rlProfile.display_name,
              mmr: parseFloat(leader.mmr),
              tier: null,
              platform: platform,
              rlrank_id: rlProfile.rlrank_id,
              playlist: leader.playlist,
              season: 3
            };

            db.upsert('leaderboards', {
              _id: leader._id
            }, leaderboardEntry,
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
      }, 1000 * index);
    });
  });
}
