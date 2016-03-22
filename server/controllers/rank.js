var db = require('../db');
var swiftping = require('../helpers/swiftping');
var psyonix = require('../services/psyonix');

module.exports = {
  getPlayerRanks,
  postLatestChanges
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

function postLatestChanges(req, res)
{
  var oldRanks = req.body.ranks;
  db.findOneWhere('profiles', {rlrank_id: req.params.id}, {},
    function(err, doc)
    {
      if (err)
      {
        console.log('[RANK] [ERROR] Could not get latestChanges profile from DB %s', req.params.id, err); // ERROR
        return swiftping.apiResponse('error', res, {code: 'server_error', message: 'Something went wrong. We have been notified.'});
      }

      var id = new Buffer(doc.hash, 'base64').toString('ascii');

      psyonix.getPlayerRanks(id, doc.platform,
        function(err, results)
        {
          if (err)
          {
            console.log('[RANK-LIVE] [ERROR] Could not get playerRanks from Psyonix %s [Hash: %s]', req.params.id, id, err); // ERROR
            return swiftping.apiResponse('error', res, {code: 'server_error', message: 'Something went wrong. We have been notified.'});
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



              if (result.Playlist == 11)
              {
                result.MMR = 35.312;
              }

              var data = {
                created_at: new Date(),
                rlrank_id: req.params.id,
                playlist: result.Playlist,
                mu: result.Mu,
                sigma: result.Sigma,
                tier: result.Tier,
                division: result.Division,
                matches_played: result.MatchesPlayed,
                mmr: parseFloat(swiftping.MMRToSkillRating(result.MMR))
              };

              ranks.push(data);
            }
          );

          var newRanks = ranks;

          oldRanks.forEach(
            function(oldRank)
            {
              newRanks.forEach(
                function(newRank, index)
                {
                  if (oldRank.playlist == newRank.playlist)
                  {
                    newRank.difference = newRank.mmr - oldRank.mmr;
                  }
                }
              );
            }
          );

          swiftping.apiResponse('ok', res, newRanks);
        }
      );
    }
  );
}
