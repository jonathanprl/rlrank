(function() {
  angular
    .module('app')
    .factory('RankSvc', function($http) {
        'use strict';

        return {
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
