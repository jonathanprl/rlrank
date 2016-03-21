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
  psyonix.getPlayerStat(req.params.id, req.params.stat, function(err, result)
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
  var fiveMinsAgo = new Date();
  fiveMinsAgo.setMinutes(fiveMinsAgo.getMinutes() - 5);

  var query = {
    rlrank_id: req.params.id
  };

  db.findOneWhere('stats', query, {},
    function(err, doc)
    {
      if (err)
      {
        console.log('[STATS] Error fetching stats from DB', err); // ERROR
      }
      else if (doc)
      {
        console.log('[STATS] Found recent stats in DB', req.params.id);
        return swiftping.apiResponse('ok', res, doc.stats);
      }
    }
  );
}
