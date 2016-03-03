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
  var stats = ['Wins', 'Goals', 'MVPs', 'Saves', 'Shots', 'Assists'];

  var promises = [];

  stats.forEach(
    function(stat)
    {
      promises.push(new Promise(
        function(resolve, reject)
        {
          psyonix.getPlayerStat(req.params.id, req.params.platform, stat,
            function(err, result)
            {
              if (err)
              {
                reject(err);
              }

              if (!result)
              {
                return resolve({name: stat, value: 'N/A'});
              }

              resolve({name: result.LeaderboardID, value: result.Value});
            }
          )
        }
      ));
    }
  );

  Promise.all(promises)
    .then(function(results)
    {
      return swiftping.apiResponse('ok', res, results);
    }
  );
}
