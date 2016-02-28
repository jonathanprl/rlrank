(function() {
  angular
    .module('app')
    .controller('HomeController', function(ApiSvc, RouteSvc, $routeParams, $location, $cacheFactory) {
        'use strict';

        var vm = this;

        vm.leaderboards = {};
        vm.goToProfile = goToProfile;

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
            }, function(err)
            {
              console.log(err.code);
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
    });
})();
