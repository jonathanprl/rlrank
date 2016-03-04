var db = require('../db');
var swiftping = require('../helpers/swiftping');
var psyonix = require('../services/psyonix');

module.exports = {
  getPlayerRanks,
  getPlayerRatings
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

      psyonix.getPlayerRanks(req.params.id, req.params.platform, function(err, results)
      {
        if (err)
        {
          return swiftping.apiResponse('error', res, err);
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
  });
}

/**
 *
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
function getPlayerRatings(req, res)
{
  // db.find('sheets', function(docs)
  // {
  //   swiftping.apiResponse('ok', res, docs);
  // },
  // function(err)
  // {
  //   swiftping.apiResponse('error', res, err);
  // });

  var playlists = [10, 11, 12, 13];
  var promises = [];

  playlists.forEach(
    function(playlist)
    {
      promises.push(new Promise(
        function (resolve, reject)
        {
          psyonix.getPlayerRating(req.params.id, playlist,
            function(err, results)
            {
              if (err)
              {
                return swiftping.apiResponse('error', res, err);
              }

              results.forEach(
                function(result)
                {
                  if ('Value' in result)
                  {
                    resolve({
                      playlist: String(playlist),
                      rating: result.Value
                    });
                  }
                }
              );
            }
          );
        }
      ));
    }
  );

  Promise.all(promises)
    .then(function(results)
    {
      db.upsert('ratings', {rlrankId: req.params.id}, {$set: {playlists: results}},
        function(err, doc)
        {

        }
      );

      swiftping.apiResponse('ok', res, results);
    }
  );
}
