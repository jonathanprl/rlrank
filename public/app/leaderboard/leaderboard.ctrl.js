(function() {
  angular
    .module('app')
    .controller('LeaderboardController', ['ApiSvc', 'RouteSvc', function(ApiSvc, RouteSvc) {
        'use strict';

        var vm = this;

        vm.goToProfile = goToProfile;
        vm.increaseLeaderboard = increaseLeaderboard;
        vm.sortLeaderboard = sortLeaderboard;
        vm.currentTab = 10;

        vm.leaderboards = {};
        vm.limit = 50;
        vm.sort = '-mmr';

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

        function sortLeaderboard(column)
        {
          if (vm.sort == column && vm.sort.indexOf('-') === -1)
          {
            vm.sort = '-' + column;
          }
          else
          {
            vm.sort = column;
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
