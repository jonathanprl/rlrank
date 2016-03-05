var db = require('../db');
var swiftping = require('../helpers/swiftping');
var psyonix = require('../services/psyonix');

var Promise = require('bluebird');
var ping = require('ping');

module.exports = {
  getPopulation: getPopulation,
  getStatus: getStatus
};

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

/**
 *
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
function getPopulation(req, res)
{
  var oneMinAgo = new Date();
  oneMinAgo.setMinutes(oneMinAgo.getMinutes() - 1);

  var query = {
    created_at: {
        $gt: oneMinAgo
    }
  }

  db.findWhere('population', query, { _id: 0 },
    function(err, doc)
    {
      console.log(doc);
      if (err)
      {
        return swiftping.apiResponse('error', res, err);
      }

      return swiftping.apiResponse('ok', res, doc);
    }
  );
}
