(function() {
  angular
    .module('app')
    .factory('RankSvc', function($http) {
        'use strict';

        return {
          authorise: authorise,
          getPlayerRanks: getPlayerRanks
        };

        function authorise(url, callback)
        {
          $http.post('/api/auth', {url: url}).then(function(response)
          {
            callback(null, response.data);
          });
        }

        function getLeaderboards(id, token, callback)
        {
          $http.post('/api/leaderboards', {
            token: token
          }).then(function(response)
          {
            callback(null, response);
          });
        }

        function getPlayerRanks(id, token, callback)
        {
          $http.post('/api/ranks/' + id, {
            token: token
          }).then(function(response)
          {
            callback(null, response.data.results);
          });
        }
    });
})();
