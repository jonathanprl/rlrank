var db = require('../db');
var swiftping = require('../helpers/swiftping');
var psyonix = require('../services/psyonix');

module.exports = {
  getLeaderboards
};

/**
 *
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
function getLeaderboards(req, res)
{
  db.aggregate('leaderboards', [ { $group: {'_id': '$playlist', players: { $push: '$$ROOT' } } }, { $project: { _id: 0, players: 1, playlist: '$_id' } } ], function(err, docs) {
    if (err)
    {
      return swiftping.apiResponse('error', res, err);
    }

    return swiftping.apiResponse('ok', res, docs);
  });
}
