(function() {
  angular
    .module('app')
    .factory('RankSvc', function($http) {
        'use strict';

        return {
          authorise: authorise,
          getPlayerRanks: getPlayerRanks
        };

        function authorise(id, name, callback)
        {
          $http.post('/api/auth', {
            id: id,
            name: name,
            platform: 'Steam'
          }).then(function(response)
          {
            console.log(response);
            callback(null, response.data.token);
          });
        }

        function getLeaderboards(id, token, callback)
        {
          $http.post('/api/leaderboards', {
            token: token
          }).then(function(response)
          {
            console.log(response);
            callback(null, response);
          });
        }

        function getPlayerRanks(id, token, callback)
        {
          $http.post('/api/ranks', {
            id: id,
            token: token,
            platform: 'Steam'
          }).then(function(response)
          {
            console.log(response);
            callback(null, response);
          });
        }
    });
})();
