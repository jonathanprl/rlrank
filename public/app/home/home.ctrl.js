(function() {
  angular
    .module('app')
    .controller('HomeController', function(RankSvc) {
        'use strict';

        var vm = this;

        vm.authorise = authorise;
        vm.getPlayerRanks = getPlayerRanks;

        function authorise()
        {
          RankSvc.authorise(vm.steamProfileUrl)
            .then(function(response)
            {
              vm.profile = response.data.profile;
              vm.token = response.data.token;

              getPlayerRanks();
            }
          );
        }

        function getPlayerRanks()
        {
          RankSvc.getPlayerRanks(vm.profile.steamid, vm.token)
            .then(function(response)
            {
              vm.playlists = response.data.results;
            }
          );
        }

        function getLeaderboards()
        {
          RankSvc.getLeaderboards(vm.profile.steamid, vm.token)
            .then(function(leaderboards)
            {
              vm.leaderboards = leaderboards;
            }
          );
        }
    });
})();
