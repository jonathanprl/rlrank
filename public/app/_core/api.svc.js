(function() {
  angular
    .module('app')
    .factory('ApiSvc', ['$http', '$cacheFactory', function($http, $cacheFactory) {
        'use strict';

        var cache = $cacheFactory('rank');

        return {
          cache: cache,
          authorise: authorise,
          getPlayerRanks: getPlayerRanks,
          getLeaderboard: getLeaderboard,
          getStatus: getStatus,
          getPopulation: getPopulation,
          getPlayerStats: getPlayerStats,
          getPlayerRating: getPlayerRating
        };

        function authorise(url, platform)
        {
          return $http.post('/api/auth', {url: url, platform: platform});
        }

        function getLeaderboard(playlist)
        {
          return $http.get('/api/leaderboard/' + playlist);
        }

        function getPlayerRanks(id, platform, callback)
        {
          return $http.get('/api/rank/' + platform + '/' + id);
        }

        function getStatus(callback)
        {
          return $http.get('/api/status/');
        }

        function getPopulation(callback)
        {
          return $http.get('/api/population');
        }

        function getPlayerStats(id, platform, callback)
        {
          return $http.get('/api/stats/' + platform + '/' + id);
        }

        function getPlayerRating(id, callback)
        {
          return $http.get('/api/rating/' + id);
        }
    }]);
})();
