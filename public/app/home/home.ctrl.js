(function() {
  angular
    .module('app')
    .controller('HomeController', function(RankSvc) {
        'use strict';

        var vm = this;

        vm.authorise = authorise;
        vm.getPlayerRanks = getPlayerRanks;
        vm.user = {};

        function authorise()
        {
          RankSvc.authorise(vm.user.id, vm.user.name, function(err, token)
          {
            vm.token = token;
          });
        }

        function getPlayerRanks()
        {
          RankSvc.getPlayerRanks(vm.user.id, vm.token, function(err, ranks)
          {
            vm.playerRanks = ranks;
          });
        }

        function getLeaderboards()
        {
          RankSvc.getLeaderboards(vm.token, function(err, leaderboards)
          {
            vm.leaderboards = leaderboards;
          });
        }
    });
})();
