var db = require('../db');
var swiftping = require('../helpers/swiftping');
var psyonix = require('./services/psyonix');

module.exports = {
  getPlayerStats: getPlayerStats,
  getPlayerStat: getPlayerStat
};

/**
 *
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
function getPlayerStat(req, res)
{
  // Todo: get specific type of stat
  psyonix.getPlayerStats(req.body.token, function(err, result)
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
function getPlayerStats(req, res)
{
  psyonix.getPlayerStats(req.body.token, function(err, result)
  {
    if (err)
    {
      return swiftping.apiResponse('error', res, err);
    }

    return swiftping.apiResponse('ok', res, result);
  });
}
