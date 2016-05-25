var db = require('../db');
var swiftping = require('../helpers/swiftping');
var psyonix = require('../services/psyonix');

module.exports = {
  getPlayerRanks
};

/**
 *
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
function getPlayerRanks(req, res)
{
  db.findWhere('ranks', {rlrank_id: req.params.id}, {_id: 0, rlrank_id: 0},
    function(err, docs)
    {
      if (err)
      {
        console.log('[RANKS] Error fetching ranks from DB', err); // ERROR
      }
      else if (docs.length > 0)
      {
        var now = new Date();

        var timeDiff = Math.abs(now.getTime() - docs[0].created_at.getTime());
        var diffHours = Math.ceil(timeDiff / (1000 * 3600));

        if (diffHours > 1)
        {
          console.log('[RANKS] Found outdated ranks in DB [%s]', req.params.id);
          return getUpdatedPlayerRanks(req, res);
        }

        console.log('[RANKS] Found recent ranks in DB [%s]', req.params.id);
        return swiftping.apiResponse('ok', res, docs);
      }

      return getUpdatedPlayerRanks(req, res);
    }
  );
}

function getUpdatedPlayerRanks(req, res)
{
  console.log('[RANKS] Getting latest player ranks from Psyonix [%s]', req.params.id);

  db.findOneWhere('profiles', {rlrank_id: req.params.id}, {},
    function(err, doc)
    {
      if (err)
      {
        console.log('[RANKS] [ERROR] Could not find profile in database [%s]', req.params.id);
        return swiftping.apiResponse('error', res, {code:'not_found', message: 'Profile was not found.'});
      }

      var profile = doc;
      var id = swiftping.decryptHash(profile.hash);

      psyonix.getPlayerRanks(id, profile.platform,
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

          var ranks = [];

          results.forEach(
            function(result)
            {
              if (result.Playlist === '0')
              {
                result.MMR = (result.Mu - (3 * result.Sigma)).toFixed(4);
              }

              var data = {
                created_at: new Date(),
                rlrank_id: req.params.id,
                playlist: parseInt(result.Playlist),
                mu: result.Mu,
                sigma: result.Sigma,
                tier: parseInt(result.Tier),
                division: parseInt(result.Division),
                matches_played: parseInt(result.MatchesPlayed),
                mmr: parseFloat(swiftping.MMRToSkillRating(result.MMR))
              };

              ranks.push(data);

              console.log('[RANKS] Insert start [ranks]', data, err);
              db.upsert('ranks', {rlrank_id: data.rlrank_id, playlist: parseInt(result.Playlist)}, data,
                function(err, doc)
                {
                  console.log('[RANKS] Insert end [ranks]', data, err);
                  if (err)
                  {
                    console.log('[RANKS] Could not save player rank to "ranks" DB', data, err); // ERROR
                  }
                }
              );

              console.log('[RANKS] Insert start [ranksHistorical]', data, err);
              db.insert('ranksHistorical', data,
                function(err, doc)
                {
                  console.log('[RANKS] Insert end [ranksHistorical]', data, err);
                  if (err)
                  {
                    console.log('[RANKS] Could not save player rank to "ranksHistorical" DB', data, err); // ERROR
                  }
                }
              );
            }
          );

          swiftping.apiResponse('ok', res, ranks);
        }
      );
    }
  );
}
