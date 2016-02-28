(function() {
  angular
    .module('app')
    .controller('HomeController', function(RankSvc, $routeParams) {
        'use strict';

        var vm = this;

        vm.authorise = authorise;
        vm.getPlayerRanks = getPlayerRanks;

        vm.leaderboards = {};

        getAllLeaderboards();

        (function()
        {
          if ($routeParams.steamName)
          {
            authorise("https://steamcommunity.com/id/" + $routeParams.steamName);
          }
        })();

        function authorise(url)
        {
          url = url || vm.steamProfileUrl;

          RankSvc.authorise(url)
            .then(function(response)
            {
              vm.profile = response.data.profile;

              getPlayerRanks();
            }
          );
        }

        function getPlayerRanks()
        {
          RankSvc.getPlayerRanks(vm.profile.steamid)
            .then(function(response)
            {
              vm.playlists = response.data.results;
            }
          );
        }

        function getLeaderboard(playlist)
        {
          RankSvc.getLeaderboard(playlist)
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
    });
})();
