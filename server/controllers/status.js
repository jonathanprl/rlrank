var db = require('../db');
var swiftping = require('../helpers/swiftping');

module.exports = {
  getPopulation,
  getPopulationHistorical,
  getStatus
};

/**
 *
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
function getPopulation(req, res)
{
  db.findWhere('population', {}, { _id: 0 },
    function(err, doc)
    {
      if (err)
      {
        return swiftping.apiResponse('error', res, err);
      }

      return swiftping.apiResponse('ok', res, doc);
    }
  );
}

/**
 *
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
function getPopulationHistorical(req, res)
{
  var weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  db.aggregate('populationHistorical',
    [
      { $match: { created_at: { $gte: weekAgo } } },
      { $group: { _id: '$players' }, totalPlayers: { $sum: '$players' } }
    ],
    function(err, doc)
    {
      if (err)
      {
        return swiftping.apiResponse('error', res, err);
      }

      return swiftping.apiResponse('ok', res, doc);
    }
  );
}

/**
 *
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
function getStatus(req, res)
{
  db.findWhere('status', {}, { _id: 0 },
    function(err, doc)
    {
      if (err)
      {
        return swiftping.apiResponse('error', res, err);
      }

      return swiftping.apiResponse('ok', res, doc);
    }
  );
}
