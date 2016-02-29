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

  psyonix.getPlayerRanks(req.params.id, function(err, results)
  {
    if (err)
    {
      return swiftping.apiResponse('error', res, err);
    }

    var filteredResults = [];

    results.forEach(
      function(result)
      {
        if (result.Playlist === '0')
        {
          result.MMR = result.Mu - (3 * result.Sigma);
        }

        filteredResults.push({
          playlist: result.Playlist,
          mu: result.Mu,
          sigma: result.Sigma,
          tier: result.Tier,
          division: result.Division,
          matches_played: result.MatchesPlayed,
          mmr: result.MMR
          });
      }
    );

    db.upsert('ranks', {steamId: req.params.id}, {$set: {playlists: filteredResults}},
      function(err, doc)
      {

      }
    );

    swiftping.apiResponse('ok', res, results);
  });
}
