var db = require('../db');
var swiftping = require('../helpers/swiftping');
var psyonix = require('../services/psyonix');

module.exports = {
  getLeaderboard: getLeaderboard,
  getLeaderboards: getLeaderboards
};

/**
 *
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
function getLeaderboard(req, res)
{
  // Todo: get specific leaderboard
  psyonix.getLeaderboards(req.body.token, function(err, result)
  {
    if (err)
    {
      return swiftping.apiResponse('error', res, err);
    }

    return swiftping.apiResponse('ok', res, result);
  });
}

/**
 *
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
function getLeaderboards(req, res)
{
  psyonix.getLeaderboards(req.body.token, function(err, result)
  {
    if (err)
    {
      return swiftping.apiResponse('error', res, err);
    }

    return swiftping.apiResponse('ok', res, result);
  });
}
