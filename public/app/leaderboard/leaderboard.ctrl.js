(function() {
  angular
    .module('app')
    .controller('LeaderboardController', ['ApiSvc', 'RouteSvc', function(ApiSvc, RouteSvc) {
        'use strict';

        var vm = this;

        vm.goToProfile = goToProfile;
        vm.leaderboards = {};
        vm.sort = {};
        vm.sortLeaderboard = sortLeaderboard;

        (function()
        {
          getAllLeaderboards();
        })();

        function getLeaderboard(playlist)
        {
          vm.sort[playlist] = "";
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

        function goToProfile(url)
        {
          vm.showLoader = true;

          RouteSvc.goToProfile(url,
            function(err)
            {
              vm.profileError = err.message;
              vm.showLoader = false;
            }
          );
        }

        function sortLeaderboard(playlist, column)
        {
          if (vm.sort[playlist] == column && vm.sort[playlist].indexOf('-') === -1)
          {
            vm.sort[playlist] = '-' + column;
          }
          else
          {
            vm.sort[playlist] = column;
          }

          console.log(vm.sort);
        }
    }]);
})();
