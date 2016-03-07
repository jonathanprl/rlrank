var db = require('../db');
var swiftping = require('../helpers/swiftping');
var psyonix = require('../services/psyonix');

module.exports = {
  getTierThresholds: getTierThresholds
};

function getTierThresholds(req, res)
{
  var query = {

  };

  db.aggregate('ranks_stats', [
    {
      $match:
      {
        mmr: { $gte: 0 },
        tier: { $gte: 0 }
      }
    },
    {
      $group:
      {
        _id: '$tier',
        max: { $max: '$mmr'},
        min: { $min: '$mmr'}
      }
    },
    {
      $sort:
      {
        _id: 1
      }
    }
  ], function(err, doc)
  {
    if (err)
    {
      console.log('[STATISTICS] Error aggregating tier thresholds', err); // ERROR
      return swiftping.apiResponse('error', res, {'code': 'server_error', 'message': 'There was a problem. We have been notified'});
    }

    return swiftping.apiResponse('ok', res, doc);
  });
}
