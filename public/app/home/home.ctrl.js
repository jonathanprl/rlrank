(function() {
  angular
    .module('app')
    .controller('HomeController', function(ApiSvc, RouteSvc, $routeParams, $location, $cacheFactory) {
        'use strict';

        var vm = this;

        vm.leaderboards = {};
        vm.router = RouteSvc;

        (function()
        {
          getAllLeaderboards();
        })();

        function getLeaderboard(playlist)
        {
          ApiSvc.getLeaderboard(playlist)
            .then(function(response)
            {
              vm.leaderboards[playlist] = response.data.results;
            }
          );
        }

        function getAllLeaderboards()
        {
          getLeaderboard(10);
          getLeaderboard(11);
          getLeaderboard(12);
          getLeaderboard(13);
        }
    });
})();
