(function() {
  angular
    .module('app')
    .controller('HomeController', ['ApiSvc', 'RouteSvc', '$routeParams', '$location', function(ApiSvc, RouteSvc, $routeParams, $location) {
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

        function goToProfile(input)
        {
          vm.showLoader = true;
          ApiSvc.authorise(input)
            .then(
              function(response)
              {
                $location.path('u/' + response.rlrank_id);
              })
            .catch(
              function(err)
              {
                vm.profileError = err.data.message;
                vm.showLoader = false;
              }
            );
        }
    }]);
})();
