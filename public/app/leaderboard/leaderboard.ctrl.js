(function() {
  angular
    .module('app')
    .controller('LeaderboardController', ['ApiSvc', 'RouteSvc', 'TitleSvc', function(ApiSvc, RouteSvc, TitleSvc) {
        'use strict';

        var vm = this;

        vm.goToProfile = goToProfile;
        vm.increaseLeaderboard = increaseLeaderboard;
        vm.sortLeaderboard = sortLeaderboard;

        vm.leaderboards = {};
        vm.limit = 50;
        vm.sort = {
          10: "-mmr",
          11: "-mmr",
          12: "-mmr",
          13: "-mmr"
        };

        (function()
        {
          TitleSvc.setTitle("Leaderboards");
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

        function increaseLeaderboard()
        {
          if (vm.limit < 200)
          {
            vm.limit += 50;
          }
        }
    }]);
})();
