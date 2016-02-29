(function() {
  angular
    .module('app')
    .controller('HomeController', ['ApiSvc', 'RouteSvc', '$routeParams', '$location', '$cacheFactory', function(ApiSvc, RouteSvc, $routeParams, $location, $cacheFactory) {
        'use strict';

        var vm = this;

        vm.leaderboards = {};
        vm.goToProfile = goToProfile;

        (function()
        {
          getAllLeaderboards();
          getPopulation();
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

        function getPopulation()
        {
          ApiSvc.getPopulation().then(
            function(response)
            {
              vm.playlistPopulation = response.data.results;

              vm.totalPopulation = 0;
              angular.forEach(vm.playlistPopulation,
                function(playlist)
                {
                  vm.totalPopulation += parseInt(playlist.players);
                }
              );
            }
          )
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
    }]);
})();
