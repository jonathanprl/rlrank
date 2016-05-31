var db = require('../db');
var swiftping = require('../helpers/swiftping');
var psyonix = require('../services/psyonix');

module.exports = {
  getPlayerRanks,
  getRankTiers
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
        var diffMins = Math.ceil(timeDiff / (1000 * 60));

        if (diffMins > 15)
        {
          console.log('[RANKS] Found outdated ranks in DB [%s]', req.params.id);
          return getUpdatedPlayerRanks(req, res);
        }

        console.log('[RANKS] Found recent ranks in DB [%s]', req.params.id);

        return _getRankThresholds(docs,
          function(err, ranks)
          {
            if (err)
            {
              return swiftping.apiResponse('error', res, err);
            }

            return swiftping.apiResponse('ok', res, ranks);
          }
        );
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

              db.upsert('ranks', {rlrank_id: data.rlrank_id, playlist: parseInt(result.Playlist)}, data,
                function(err, doc)
                {
                  if (err)
                  {
                    console.log('[RANKS] Could not save player rank to "ranks" DB', data, err); // ERROR
                  }
                }
              );

              db.insert('ranksHistorical', data,
                function(err, doc)
                {
                  if (err)
                  {
                    console.log('[RANKS] Could not save player rank to "ranksHistorical" DB', data, err); // ERROR
                  }
                }
              );
            }
          );

          _getRankThresholds(ranks,
            function(err, ranks)
            {
              if (err)
              {
                return swiftping.apiResponse('error', res, err);
              }

              swiftping.apiResponse('ok', res, ranks);
            }
          );
        }
      );
    }
  );
}

/**
 *
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
function getRankTiers(req, res)
{
  _getRankTiers(
    function(err, docs)
    {
      if (err)
      {
        return swiftping.apiResponse('error', res, 'Could not get ranking tiers.');
      }

      swiftping.apiResponse('ok', res, docs);
    }
  );
};

function _getRankTiers(callback)
{
  console.log('[RANK_TIERS] Getting ranking tiers from ranksHistorical.');
  db.aggregate('ranksHistorical', [ { $group: {_id: '$tier', minMMR: { $min: '$mmr' }, maxMMR: { $max: '$mmr' } } }, { $sort: { _id: 1 } }, { $project: { _id: 0, tier: '$_id', minMMR: 1, maxMMR: 1 } } ],
    function(err, docs)
    {
      if (err)
      {
        console.log('[RANK_TIERS] Could not get ranking tiers from ranksHistorical.', err);
        return callback('Could not get ranking tiers.');
      }

      callback(null, docs);
    }
  );
}

function _getRankThresholds(playlists, callback)
{
  _getRankTiers(
    function(err, tiers)
    {
      if (err)
      {
        return callback(err);
      }

      var ranks = playlists.map(
        function(playlist) {

          if (!playlist.tier || tiers[playlist.tier+1].tier != playlist.tier)
          {
            return playlist;
          }

          var max = tiers[playlist.tier+1].maxMMR;
          var min = tiers[playlist.tier+1].minMMR;
          var mmr = playlist.mmr;

          var threshold = (max - min) / 4;
          if (mmr >= (max - threshold))
          {
            playlist.threshold = 1;
          }
          else if (mmr <= (min + threshold))
          {
            playlist.threshold = -1;
          }

          return playlist;
        }
      );

      callback(null, ranks);
    }
  );
}
