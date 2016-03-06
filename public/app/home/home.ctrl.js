(function() {
  angular
    .module('app')
    .controller('HomeController', ['ApiSvc', 'RouteSvc', 'TitleSvc', '$routeParams', '$location', function(ApiSvc, RouteSvc, TitleSvc, $routeParams, $location) {
        'use strict';

        var vm = this;

        vm.goToProfile = goToProfile;
        vm.setPlatform = setPlatform;

        vm.leaderboards = {};
        vm.placeholder = {
          'steam': "Enter a Steam profile URL, ID or name",
          'psn': "Enter a PSN username",
          'xbox': "Enter a Xbox Live gamertag"
        };
        vm.platform = {id: 'steam', name: 'Steam'};

        (function()
        {
          TitleSvc.setDefault();
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

        function goToProfile()
        {
          vm.showLoader = true;
          ApiSvc.authorise(vm.input, vm.platform.id)
            .then(
              function(response)
              {
                $location.path('u/' + response.data.profile.rlrank_id + '/' + response.data.profile.platform.toLowerCase());
              })
            .catch(
              function(err)
              {
                vm.profileError = err.data.message;
                vm.showLoader = false;
              }
            );
        }

        function setPlatform(platform)
        {
          if (platform == 'psn')
          {
            vm.platform = {id: 'psn', name: 'Playstation'};
          }
          else
          {
            vm.platform = {id: platform, name: platform.charAt(0).toUpperCase() + platform.slice(1)};
          }
        }
    }]);
})();
