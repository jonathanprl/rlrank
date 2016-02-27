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
  psyonix.getLeaderboard(req.params.playlist, function(err, result)
  {
    if (err)
    {
      return swiftping.apiResponse('error', res, err);
    }

    return swiftping.apiResponse('ok', res, result);
  });
}
