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
          RankSvc.authorise(vm.steamProfileUrl, function(err, auth)
          {
            vm.profile = auth.profile;
            vm.token = auth.token;
          });
        }

        function getPlayerRanks()
        {
          RankSvc.getPlayerRanks(vm.profile.steamid, vm.token, function(err, ranks)
          {
            vm.playerRanks = ranks;
          });
        }

        function getLeaderboards()
        {
          RankSvc.getLeaderboards(vm.profile.steamid, vm.token, function(err, leaderboards)
          {
            vm.leaderboards = leaderboards;
          });
        }
    });
})();
