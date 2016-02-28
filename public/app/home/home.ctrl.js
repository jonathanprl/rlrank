(function() {
  angular
    .module('app')
    .controller('HomeController', function(RankSvc, $routeParams, $location) {
        'use strict';

        var vm = this;

        vm.authorise = authorise;
        vm.getPlayerRanks = getPlayerRanks;

        vm.leaderboards = {};
        vm.shareUrl = $location.absUrl();

        getAllLeaderboards();

        (function()
        {
          if ($routeParams.steam)
          {
            if (!isNaN(parseFloat($routeParams.steam)) && isFinite($routeParams.steam) && $routeParams.steam.length == 17)
            {
              authorise("https://steamcommunity.com/profiles/" + $routeParams.steam);
            }
            else
            {
              authorise("https://steamcommunity.com/id/" + $routeParams.steam);
            }
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
