var db = require('../db');
var swiftping = require('../helpers/swiftping');
var psyonix = require('../services/psyonix');

module.exports = {
  getStats: getStats
};

/**
 *
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
function getStats(req, res)
{
  db.findWhere('stats', {rlrank_id: req.params.id}, {},
    function(err, doc)
    {
      if (err)
      {
        console.log('[STATS] Error fetching stats from DB', err); // ERROR
      }
      else if (doc.length > 0)
      {
        console.log('[STATS] Found recent stats in DB', req.params.id);
        return swiftping.apiResponse('ok', res, doc);
      }

      console.log('[STATS] New Player! Getting player stats from Psyonix', req.params.id);

      db.findOneWhere('profiles', {rlrank_id: req.params.id}, {},
        function(err, doc)
        {
          var profile = doc;
          var id = new Buffer(profile.hash, 'base64').toString('ascii');

          psyonix.getPlayerStats(id, profile.platform,
            function(err, stats)
            {
              if (err)
              {
                console.log('[STATS] Error getting stats from Psyonix', req.params.id, err);
                return swiftping.apiResponse('error', res, {code: 'server_error', message: 'Something went wrong.'});
              }

              console.log('[STATS] Fetched stats from Psyonix', req.params.id);

              var responseStats = [];

              stats.forEach(
                function(stat)
                {
                  var stat = stat[0];

                  if ('Value' in stat)
                  {
                    var data = {
                      created_at: new Date(),
                      rlrank_id: req.params.id,
                      type: stat.LeaderboardID,
                      value: stat.Value
                    };

                    responseStats.push(data);

                    db.insert('stats', data,
                      function(err, doc)
                      {
                        if (err)
                        {
                          console.log('[STATS] Could not save player stats to DB', req.params.id, err); // ERROR
                        }
                      }
                    );

                    db.insert('statsHistorical', data,
                      function(err, doc)
                      {
                        if (err)
                        {
                          console.log('[STATS] Could not save player statsHistorical to DB', req.params.id, err); // ERROR
                        }
                      }
                    );
                  }
                  else
                  {
                    console.log('[STATS] Empty stats from Psyonix', req.params.id, stat); // ERROR
                  }
                }
              );

              return swiftping.apiResponse('ok', res, responseStats);
            }
          );
        }
      );
    }
  );
}
