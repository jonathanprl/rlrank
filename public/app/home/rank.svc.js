(function() {
  angular
    .module('app')
    .factory('RankSvc', function($http) {
        'use strict';

        return {
          authorise: authorise,
          getPlayerRanks: getPlayerRanks
        };

        function authorise(url)
        {
          return $http.post('/api/auth', {url: url});
        }

        function getLeaderboards(id, token)
        {
          return $http.post('/api/leaderboards', {
            token: token
          });
        }

        function getPlayerRanks(id, token, callback)
        {
          return $http.post('/api/ranks/' + id, {
            token: token
          });
        }
    });
})();
