(function() {
  angular
    .module('app')
    .controller('LeaderboardController', ['ApiSvc', 'RouteSvc', function(ApiSvc, RouteSvc) {
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
    }]);
})();
