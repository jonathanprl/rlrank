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
          if (url.indexOf('://steamcommunity.com') > -1)
          {
            RouteSvc.goToProfile(url);
            vm.showLoader = true;
            vm.profileError = "URL must be of the format: https://steamcommunity.com/profiles/<id> or https://steamcommunity.com/id/<name>";
          }
        }
    });
})();
