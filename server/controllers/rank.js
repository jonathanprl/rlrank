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
    function(err, doc)
    {
      if (err)
      {
        console.log('[RANKS] Error fetching rank from DB', err); // ERROR
      }
      else if (doc.length > 0)
      {
        console.log('[RANKS] Found recent rank in DB', req.params.id);
        return swiftping.apiResponse('ok', res, doc);
      }

      console.log('[RANKS] New user! Getting player rank from Psyonix', req.params.id);

      db.findOneWhere('profiles', {rlrank_id: req.params.id}, {},
        function(err, doc)
        {
          if (err)
          {
            console.log('[RANKS] [ERROR] Could not find profile in database', req.params.id);
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

                  db.insert('ranks', data,
                    function(err, doc)
                    {
                      if (err)
                      {
                        console.log('[RANKS] Could not save player rank to DB', rank, err); // ERROR
                      }
                    }
                  );

                  db.insert('ranksHistorical', data,
                    function(err, doc)
                    {
                      if (err)
                      {
                        console.log('[RANKS] Could not save player rank to DB', rank, err); // ERROR
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
  );
}
