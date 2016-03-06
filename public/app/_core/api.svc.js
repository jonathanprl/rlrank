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
          getProfile: getProfile,
          getLeaderboard: getLeaderboard,
          getStatus: getStatus,
          getPopulation: getPopulation,
          getPlayerStats: getPlayerStats
        };

        function authorise(input, platform)
        {
          return $http.post('/api/auth', {input: input, platform: platform});
        }

        function getProfile(id)
        {
          return $http.get('/api/profile/' + id);
        }

        function getLeaderboard(playlist)
        {
          return $http.get('/api/leaderboard/' + playlist);
        }

        function getPlayerRanks(id)
        {
          return $http.get('/api/rank/' + id);
        }

        function getStatus()
        {
          return $http.get('/api/status/');
        }

        function getPopulation()
        {
          return $http.get('/api/population');
        }

        function getPlayerStats(id)
        {
          return $http.get('/api/stats/' + id);
        }
    }]);
})();
