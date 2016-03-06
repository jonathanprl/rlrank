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
  var fiveMinsAgo = new Date();
  fiveMinsAgo.setMinutes(fiveMinsAgo.getMinutes() - 5);

  var query = {
    rlrank_id: req.params.id,
    created_at: {
        $gte: fiveMinsAgo,
        $lt: new Date()
    }
  }

  db.findOneWhere('ranks', query, {},
    function(err, doc)
    {
      if (err)
      {
        console.log("[RANKS] Error fetching rank from DB", err); // ERROR
      }
      else if (doc)
      {
        console.log("[RANKS] Found recent rank in DB", req.params.id);
        return swiftping.apiResponse('ok', res, doc.playlists);
      }

      console.log("[RANKS] Getting player rank from Psyonix", req.params.id);

      db.findOneWhere('profiles', {rlrank_id: req.params.id}, {},
        function(err, doc)
        {
          if (err)
          {
            console.log("[RANKS] [ERROR] Could not found profile in database", req.params.id);
            return swiftping.apiResponse('error', res, {code:'not_found', message: 'Profile was not found.'});
          }

          var profile = doc;
          var id = new Buffer(profile.hash, 'base64').toString('ascii');

          psyonix.getPlayerRanks(id, profile.platform, function(err, results)
          {
            if (err)
            {
              return swiftping.apiResponse('error', res, err);
            }

            if (results.length === 0)
            {
              return swiftping.apiResponse('error', res, {code: 'invalid_user', message: 'Invalid user.'});
            }

            var filteredResults = [];

            results.forEach(
              function(result)
              {
                if (result.Playlist === '0')
                {
                  result.MMR = (result.Mu - (3 * result.Sigma)).toFixed(4);
                }

                filteredResults.push({
                  playlist: result.Playlist,
                  mu: result.Mu,
                  sigma: result.Sigma,
                  tier: result.Tier,
                  division: result.Division,
                  matches_played: result.MatchesPlayed,
                  mmr: parseFloat(swiftping.MMRToSkillRating(result.MMR))
                });
              }
            );

            if (!results)
            {
              filteredResults = [
                {playlist: 0, mu: 'N/A', sigma: 'N/A', tier: 0, division: 'N/A', matches_played: 'N/A', mmr: 0},
                {playlist: 10, mu: 'N/A', sigma: 'N/A', tier: 0, division: 'N/A', matches_played: 'N/A', mmr: 0},
                {playlist: 11, mu: 'N/A', sigma: 'N/A', tier: 0, division: 'N/A', matches_played: 'N/A', mmr: 0},
                {playlist: 12, mu: 'N/A', sigma: 'N/A', tier: 0, division: 'N/A', matches_played: 'N/A', mmr: 0},
                {playlist: 13, mu: 'N/A', sigma: 'N/A', tier: 0, division: 'N/A', matches_played: 'N/A', mmr: 0}
              ];
            }

            var rank = {
              created_at: new Date(),
              rlrank_id: req.params.id,
              playlists: filteredResults
            }

            db.insert('ranks', rank,
              function(err, doc)
              {
                if (err)
                {
                  console.log("[RANKS] Could not save player rank to DB", rank, err); // ERROR
                }
              }
            );

            swiftping.apiResponse('ok', res, filteredResults);
          }
        );
      }
    );
  });
}
