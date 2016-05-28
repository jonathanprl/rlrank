(function() {
  angular
    .module('app')
    .controller('HomeController', ['ApiSvc', 'RouteSvc', 'TwitchSvc', '$routeParams', '$location', 'Analytics', HomeController]);

  function HomeController(ApiSvc, RouteSvc, TwitchSvc, $routeParams, $location, Analytics)
  {
    'use strict';

    var vm = this;

    vm.leaderboards = {};

    (function()
    {
      getAllLeaderboards();
      getPopulation();
      getPopulationHistorical();
      getTwitchStreams();
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
      );
    }

    function getPopulationHistorical()
    {
      ApiSvc.getPopulationHistorical().then(
        function(response)
        {
          vm.populationHistorical = response.data.results;
        }
      );
    }

    function getTwitchStreams()
    {
      TwitchSvc.getStreams()
        .then(function(response) {
          vm.twitchStreams = response.data.streams;
        });
    }
  }
})();
