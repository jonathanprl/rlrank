(function() {
  angular
    .module('app')
    .factory('ApiSvc', function($http, $cacheFactory) {
        'use strict';

        var cache = $cacheFactory('rank');

        return {
          cache,
          authorise,
          getPlayerRanks,
          getLeaderboard
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
    });
})();
