(function() {
  angular
    .module('app')
    .controller('LeaderboardController', ['ApiSvc', 'RouteSvc', function(ApiSvc, RouteSvc) {
        'use strict';

        var vm = this;

        vm.goToProfile = goToProfile;
        vm.increaseLeaderboard = increaseLeaderboard;
        vm.sortLeaderboard = sortLeaderboard;

        vm.leaderboards = {};
        vm.limit = 50;
        vm.sort = {
          10: '-mmr',
          11: '-mmr',
          12: '-mmr',
          13: '-mmr'
        };

        ApiSvc.getLeaderboards(3)
          .then(function(response)
          {
            vm.leaderboards = response.data.results;
          }
        );

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
