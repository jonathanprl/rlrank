var db = require('../db');
var swiftping = require('../helpers/swiftping');
var psyonix = require('../services/psyonix');
var config = require('../../config');

module.exports = {
  getPlayerStats
};

// /**
//  *
//  * @param {object} req - Express request
//  * @param {object} res - Express response
//  */
// function getStats(req, res)
// {
//   db.findWhere('stats', {rlrank_id: req.params.id}, {},
//     function(err, doc)
//     {
//       if (err)
//       {
//         console.log('[STATS] Error fetching stats from DB', err); // ERROR
//       }
//       else if (doc.length > 0)
//       {
//         console.log('[STATS] Found recent stats in DB', req.params.id);
//         return swiftping.apiResponse('ok', res, doc);
//       }
//
//       console.log('[STATS] New Player! Getting player stats from Psyonix', req.params.id);
//
//       db.findOneWhere('profiles', {rlrank_id: req.params.id}, {},
//         function(err, doc)
//         {
//           var profile = doc;
//           var id = new Buffer(profile.hash, 'base64').toString('ascii');
//
//           psyonix.getPlayerStats(id, profile.platform,
//             function(err, stats)
//             {
//               if (err)
//               {
//                 console.log('[STATS] Error getting stats from Psyonix', req.params.id, err);
//                 return swiftping.apiResponse('error', res, {code: 'server_error', message: 'Something went wrong.'});
//               }
//
//               if (!stats)
//               {
//                 return swiftping.apiResponse('ok', res, []);
//               }
//
//               console.log('[STATS] Fetched stats from Psyonix', req.params.id);
//
//               var responseStats = [];
//
//               stats.forEach(
//                 function(stat)
//                 {
//                   if (!stat)
//                   {
//                     return;
//                   }
//
//                   var stat = stat[0];
//
//                   if ('Value' in stat)
//                   {
//                     var data = {
//                       created_at: new Date(),
//                       rlrank_id: req.params.id,
//                       type: stat.LeaderboardID,
//                       value: stat.Value
//                     };
//
//                     responseStats.push(data);
//
//                     db.insert('stats', data,
//                       function(err, doc)
//                       {
//                         if (err)
//                         {
//                           console.log('[STATS] Could not save player stats to DB', req.params.id, err); // ERROR
//                         }
//                       }
//                     );
//
//                     db.insert('statsHistorical', data,
//                       function(err, doc)
//                       {
//                         if (err)
//                         {
//                           console.log('[STATS] Could not save player statsHistorical to DB', req.params.id, err); // ERROR
//                         }
//                       }
//                     );
//                   }
//                   else
//                   {
//                     console.log('[STATS] Empty stats from Psyonix', req.params.id, stat); // ERROR
//                   }
//                 }
//               );
//
//               return swiftping.apiResponse('ok', res, responseStats);
//             }
//           );
//         }
//       );
//     }
//   );
// }

/**
 *
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
function getPlayerStats(req, res)
{
  db.findWhere('stats', {rlrank_id: req.params.id}, {_id: 0, rlrank_id: 0},
    function(err, docs)
    {
      if (err)
      {
        console.log('[STATS] Error fetching stats from DB', err); // ERROR
      }
      else if (docs.length > 0)
      {
        var now = new Date();

        var timeDiff = Math.abs(now.getTime() - docs[0].created_at.getTime());
        var diffHours = Math.ceil(timeDiff / (1000 * 3600));

        if (diffHours > 24 && !config.psyonix.bypass)
        {
          console.log('[STATS] Found outdated stats in DB [%s]', req.params.id);
          return getUpdatedPlayerStats(req, res);
        }

        console.log('[STATS] Found recent stats in DB [%s]', req.params.id);
        return swiftping.apiResponse('ok', res, docs);
      }

      return getUpdatedPlayerStats(req, res);
    }
  );
}

function getUpdatedPlayerStats(req, res)
{
  console.log('[STATS] Getting latest player stats from Psyonix [%s]', req.params.id);

  if (config.psyonix.bypass)
  {
    console.log('[STATS] Bypassed... [%s]', req.params.id);
    return swiftping.apiResponse('error', res, []);
  }

  db.findOneWhere('profiles', {rlrank_id: req.params.id}, {},
    function(err, doc)
    {
      if (err)
      {
        console.log('[STATS] [ERROR] Could not find profile in database [%s]', req.params.id);
        return swiftping.apiResponse('error', res, {code:'not_found', message: 'Profile was not found.'});
      }

      var profile = doc;
      var id = swiftping.decryptHash(profile.hash);

      psyonix.getPlayerStats(id, profile.platform,
        function(err, results)
        {
          if (err)
          {
            return swiftping.apiResponse('error', res, err);
          }

          if (results.length === 0)
          {
            return swiftping.apiResponse('error', res, {code: 'invalid_user', message: 'Invalid user.'});
          }

          var stats = [];

          results.forEach(
            function(result)
            {
              result = result[0];

              var data = {
                created_at: new Date(),
                rlrank_id: req.params.id,
                type: result ? result.LeaderboardID : null,
                value: result ? result.Value : null
              };

              if (result && 'Value' in result)
              {
                stats.push(data);

                db.upsert('stats', {rlrank_id: data.rlrank_id, type: data.type}, data,
                  function(err, doc)
                  {
                    if (err)
                    {
                      console.log('[STATS] Could not save player stats to "stats" DB', data, err); // ERROR
                    }
                  }
                );

                db.insert('statsHistorical', data,
                  function(err, doc)
                  {
                    if (err)
                    {
                      console.log('[STATS] Could not save player stats to "statsHistorical" DB', data, err); // ERROR
                    }
                  }
                );
              }
            }
          );

          if (stats.length == 0)
          {
            return swiftping.apiResponse('error', res, {code: 'server_error_2', message: 'There was a problem.'});
          }

          swiftping.apiResponse('ok', res, stats);
        }
      );
    }
  );
}
