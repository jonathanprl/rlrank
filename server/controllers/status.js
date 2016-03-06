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
  db.aggregate('populationHistorical', {},
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
