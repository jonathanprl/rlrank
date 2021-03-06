(function() {
  angular
    .module('app')
    .factory('ApiSvc', ['$http', '$cacheFactory', ApiSvc]);

  function ApiSvc($http, $cacheFactory)
  {
    'use strict';

    var cache = $cacheFactory('rank');

    return {
      cache: cache,
      getProfile: getProfile,
      getProfileById: getProfileById,
      getPlayerRanks: getPlayerRanks,
      getLeaderboards: getLeaderboards,
      getStatus: getStatus,
      getPopulation: getPopulation,
      getPopulationHistorical: getPopulationHistorical,
      getPlayerStats: getPlayerStats,
      getTierThresholds: getTierThresholds,
      getRankTiers: getRankTiers,
      postPlayerRanksLive: postPlayerRanksLive,
      getPlayerRanksHistorical: getPlayerRanksHistorical,
      getAlerts: getAlerts
    };

    function getProfile(input, platform)
    {
      return $http.get('/api/profile/' + encodeURIComponent(input) + '/' + encodeURIComponent(platform));
    }

    function getProfileById(id)
    {
      return $http.get('/api/profileById/' + encodeURIComponent(id));
    }

    function getLeaderboards(season)
    {
      return $http.get('/api/leaderboards?season=' + season);
    }

    function getPlayerRanks(id)
    {
      return $http.get('/api/rank/' + encodeURIComponent(id));
    }

    function getPlayerRanksHistorical(id)
    {
      return $http.get('/api/rank/' + encodeURIComponent(id) + '/historical');
    }

    function getStatus()
    {
      return $http.get('/api/status/');
    }

    function getPopulation()
    {
      return $http.get('/api/population');
    }

    function getPopulationHistorical()
    {
      return $http.get('/api/population/historical');
    }

    function getPlayerStats(id)
    {
      return $http.get('/api/stats/' + encodeURIComponent(id));
    }

    function getTierThresholds()
    {
      return $http.get('/api/statistics/tierThresholds');
    }

    function getRankTiers(season)
    {
      return $http.get('/api/rank/tiers?season=' + season);
    }

    function postPlayerRanksLive(id, ranks)
    {
      return $http.post('/api/rank/' + id + '/live', {ranks: ranks});
    }

    function getAlerts()
    {
      return $http.get('/api/alerts');
    }
  };
})();
