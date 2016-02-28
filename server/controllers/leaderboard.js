var db = require('../db');
var swiftping = require('../helpers/swiftping');
var psyonix = require('../services/psyonix');

module.exports = {
  getLeaderboard
};

/**
 *
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
function getLeaderboard(req, res)
{

  db.findOne('leaderboards', {playlist: req.params.playlist},
    function(err, doc)
    {
      if (err)
      {
        return swiftping.apiResponse('error', res, err);
      }

      if (doc)
      {
        return swiftping.apiResponse('ok', res, doc.leaderboard);
      }

      console.log("No leaderboard found in DB, fetching from Psyonix..."); // warning

      psyonix.getLeaderboard(req.params.playlist, function(err, results)
      {
        if (err)
        {
          return swiftping.apiResponse('error', res, err);
        }

        db.upsert('leaderboards', {playlist: req.params.playlist}, {$set: {leaderboard: results}},
          function(err, doc)
          {

          }
        );

        return swiftping.apiResponse('ok', res, results);
      });
    }
  );
}
