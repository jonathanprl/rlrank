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
          getPlayerStats: getPlayerStats
        };

        function authorise(url)
        {
          return $http.post('/api/auth', {url: url});
        }

        function getLeaderboard(playlist)
        {
          return $http.get('/api/leaderboard/' + playlist);
        }

        function getPlayerRanks(id, callback)
        {
          return $http.get('/api/ranks/' + id);
        }

        function getStatus(callback)
        {
          return $http.get('/api/status/');
        }

        function getPlayerStats(id, callback)
        {
          return $http.get('/api/stats/' + id);
        }
    }]);
})();
