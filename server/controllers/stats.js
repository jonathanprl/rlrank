var db = require('../db');
var swiftping = require('../helpers/swiftping');
var psyonix = require('../services/psyonix');

module.exports = {
  getStats: getStats,
  getStat: getStat
};

/**
 *
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
function getStat(req, res)
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
function getStats(req, res)
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
