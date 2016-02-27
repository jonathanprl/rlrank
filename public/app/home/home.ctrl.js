(function() {
  angular
    .module('app')
    .controller('HomeController', function(RankSvc) {
        'use strict';

        var vm = this;

        vm.authorise = authorise;
        vm.getPlayerRanks = getPlayerRanks;

        vm.leaderboards = [
          [
            {name: "Jonnerz", mmr: "1800"},
            {name: "Jonnerz", mmr: "1800"},
            {name: "Jonnerz", mmr: "1800"},
            {name: "Jonnerz", mmr: "1800"}
          ],
          [
            {name: "Jonnerz", mmr: "1800"},
            {name: "Jonnerz", mmr: "1800"},
            {name: "Jonnerz", mmr: "1800"},
            {name: "Jonnerz", mmr: "1800"}
          ],
          [
            {name: "Jonnerz", mmr: "1800"},
            {name: "Jonnerz", mmr: "1800"},
            {name: "Jonnerz", mmr: "1800"},
            {name: "Jonnerz", mmr: "1800"}
          ],
          [
            {name: "Jonnerz", mmr: "1800"},
            {name: "Jonnerz", mmr: "1800"},
            {name: "Jonnerz", mmr: "1800"},
            {name: "Jonnerz", mmr: "1800"}
          ]
        ]

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
