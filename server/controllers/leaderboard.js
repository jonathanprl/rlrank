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
  db.findOne('leaderboards', {playlist: parseInt(req.params.playlist)},
    function(err, doc)
    {
      if (err)
      {
        return swiftping.apiResponse('error', res, err);
      }

      return swiftping.apiResponse('ok', res, doc.leaderboard);
    }
  );
}
