(function() {
  angular
    .module('app')
    .factory('ProfileSvc', function($http, $cacheFactory) {
        'use strict';

        var cache = $cacheFactory('profile');

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
