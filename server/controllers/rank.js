var db = require('../db');
var swiftping = require('../helpers/swiftping');
var psyonix = require('../services/psyonix');

module.exports = {
  getPlayerRanks: getPlayerRanks
};

/**
 *
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
function getPlayerRanks(req, res)
{
  // db.find('sheets', function(docs)
  // {
  //   swiftping.apiResponse('ok', res, docs);
  // },
  // function(err)
  // {
  //   swiftping.apiResponse('error', res, err);
  // });

  psyonix.getPlayerRanks(req.params.id, req.body.token, function(err, result)
  {
    if (err)
    {
      return swiftping.apiResponse('error', res, err);
    }

    var ranks = {};

    var playlists = result.split(/\r?\n/);

    playlists.forEach(function(playlist)
    {
      var rankedStats = playlist.split('&');
      rankedStats.forEach(function(rankedStat)
      {
        rankedStat = rankedStat.split('=');
        var playlistId = rankedStat[1];

        if (rankedStat.indexOf('Playlist') > -1)
        {
          ranks[playlistId] = {};
        }
        console.log(rankedStat);
        ranks[playlistId][rankedStat[0]] = rankedStat[1] || null;
      });
    });

    console.log(ranks);

    swiftping.apiResponse('ok', res, ranks);
  });
}
