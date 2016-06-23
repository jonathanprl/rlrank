var db = require('../db');
var swiftping = require('../helpers/swiftping');
var psyonix = require('../services/psyonix');
var config = require('../../config');

module.exports = {
  getPlayerRanks,
  getPlayerRanksById,
  getRankTiers,
  getPlayerRanksHistorical
};

/**
 *
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
function getPlayerRanks(req, res)
{
  getPlayerRanksById(req.params.id, function(err, ranks) {
    if (err)
    {
      return swiftping.apiResponse('error', res, err);
    }

    return swiftping.apiResponse('ok', res, ranks);
  });
}

function getPlayerRanksById(id, callback)
{
  db.findWhere('ranks', {rlrank_id: id, season: 3}, {_id: 0, rlrank_id: 0},
    function(err, docs)
    {
      if (err)
      {
        swiftping.logger('info', 'ranks', 'Error fetching ranks from DB', {id: id, mongoError: err});
      }
      else if (docs.length > 0)
      {
        var now = new Date();

        var timeDiff = Math.abs(now.getTime() - docs[0].created_at.getTime());
        var diffMins = Math.ceil(timeDiff / (1000 * 60));

        if (diffMins > 15 && !config.psyonix.bypass)
        {
          swiftping.logger('info', 'ranks', 'Found outdated ranks in DB [' + id + ']');
          return getUpdatedPlayerRanks(id, function(err, ranks) {
            return callback(err, ranks);
          });
        }

        swiftping.logger('info', 'ranks', 'Found recent ranks in DB [' + id + ']');

        return _getRankThresholds(docs,
          function(err, ranks)
          {
            if (err)
            {
              callback(err);
            }

            callback(null, ranks);
          }
        );
      }

      return getUpdatedPlayerRanks(id, function(err, ranks) {
        return callback(err, ranks);
      });
    }
  );
}

function getUpdatedPlayerRanks(rlrank_id, callback)
{
  swiftping.logger('info', 'ranks', 'Getting latest player ranks from Psyonix [' + rlrank_id + ']');

  if (config.psyonix.bypass)
  {
    swiftping.logger('info', 'ranks', 'Bypassed... [' + rlrank_id + ']');
    return callback(null, []);
  }

  db.findOneWhere('profiles', {rlrank_id: rlrank_id}, {},
    function(err, doc)
    {
      if (err)
      {
        swiftping.logger('error', 'ranks', 'Could not find profile in database [' + rlrank_id + ']');
        return callback({code:'not_found', message: 'Profile was not found.'});
      }

      var profile = doc;
      var hashId = swiftping.decryptHash(profile.hash);

      psyonix.getPlayerRanks(hashId, profile.platform,
        function(err, results)
        {
          if (err)
          {
            return callback(err);
          }

          if (results.length === 0)
          {
            swiftping.logger('debug', 'ranks', 'Played no ranked.', {rlrank_id: rlrank_id, hash: hashId, platform: profile.platform});
            return callback(null, []);
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
                rlrank_id: rlrank_id,
                playlist: parseInt(result.Playlist),
                mu: result.Mu,
                sigma: result.Sigma,
                tier: parseInt(result.Tier),
                division: parseInt(result.Division),
                matches_played: parseInt(result.MatchesPlayed),
                mmr: parseFloat(swiftping.MMRToSkillRating(result.MMR)),
                season: 3
              };

              ranks.push(data);

              db.upsert('ranks', {rlrank_id: data.rlrank_id, playlist: parseInt(result.Playlist)}, data,
                function(err, doc)
                {
                  if (err)
                  {
                    swiftping.logger('error', 'ranks', 'Could not save player rank to "ranks" DB', {data: data, mongoError: err});
                  }
                }
              );

              db.insert('ranksHistorical', data,
                function(err, doc)
                {
                  if (err)
                  {
                    swiftping.logger('error', 'ranks', 'Could not save player rank to "ranksHistorical" DB', {data: data, mongoError: err});
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
                return callback(error);
              }

              return callback(null, ranks);
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
  _getRankTiers(req.query.season,
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

function _getRankTiers(season, callback)
{
  swiftping.logger('info', 'rank', 'Getting S' + season + ' ranking tiers from ranksHistorical');

  var multiplier = 1;

  if (season == 2)
  {
    multiplier = 2;
  }

  db.aggregate('ranksHistorical', [
    {
      $match: {
        season: parseInt(season)
      }
    }, {
      $group: {
        _id: {
          tier: '$tier',
          division: '$division'
        },
        minMMR: {
          $min: '$mmr'
        },maxMMR: {
          $max: '$mmr'
        },
        count: { $sum: 1 }
      }
    }, {
      $group: {
        _id: '$_id.tier',
        divisions: {
          $push: {
            division: '$_id.division',
            minMMR: '$minMMR',
            maxMMR: '$maxMMR',
            count: { $sum: { $multiply : ['$count', multiplier] } }
          }
        },
        count: { $sum: { $multiply : ['$count', multiplier] } }
      }
    }, {
      $sort: {
        _id: 1
      }
    }, {
      $project: {
        _id: 0,
        divisions: '$divisions',
        tier: '$_id',
        count: '$count'
      }
    }
  ], function(err, docs) {
    if (err)
    {
      console.log('[RANK_TIERS] Could not get ranking tiers from ranksHistorical.', err);
      return callback({code: 'server_error', 'msg': 'Could not get ranking tiers.'});
    }

    callback(null, docs);
  });
}

function _getRankThresholds(playlists, callback)
{
  _getRankTiers(3,
    function(err, tiers)
    {
      if (err)
      {
        return callback(err);
      }

      var ranks = playlists.map(
        function(playlist) {

          if (!(playlist.tier+1 in tiers))
          {
            return {};
          }

          if (!playlist.tier || tiers[playlist.tier+1].tier != playlist.tier)
          {
            return playlist;
          }

          var divisions = tiers[playlist.tier+1].divisions;
          divisions.sort(function(a,b) {
            return (a.division > b.division) ? 1 : ((b.division > a.division) ? -1 : 0);
          });

          if (playlist.division in tiers[playlist.tier+1].divisions)
          {
            var max = tiers[playlist.tier+1].divisions[playlist.division].maxMMR;
            var min = tiers[playlist.tier+1].divisions[playlist.division].minMMR;
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
          }

          return playlist;
        }
      );

      callback(null, ranks);
    }
  );
}

/**
 *
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
function getPlayerRanksHistorical(req, res)
{
  db.aggregate('ranksHistorical', [{
    $match: {
      rlrank_id: req.params.id,
      season: parseInt(req.query.season)
    }
  }, {
    $group: {
      _id: '$playlist',
      ranks: {
        $push: {
          '_id': '$_id',
          'mmr': '$mmr'
        }
      }
    }
  }], function(err, docs) {
      if (err)
      {
        swiftping.logger('critical', 'rank_historical', 'Error fetching ranksHistorical from DB', err);
      }

      return swiftping.apiResponse('ok', res, docs);
    });
}
