(function() {
  angular
    .module('app')
    .controller('ProfileController', ['ApiSvc', 'RouteSvc', '$routeParams', '$location', '$cacheFactory', function(ApiSvc, RouteSvc, $routeParams, $location, $cacheFactory) {
        'use strict';

        var vm = this;

        vm.authorise = authorise;
        vm.getPlayerRanks = getPlayerRanks;
        vm.leaderboards = {};
        vm.shareUrl = $location.absUrl();
        vm.router = RouteSvc;

        (function()
        {
          if (!isNaN(parseFloat($routeParams.rlrank_id)) && isFinite($routeParams.rlrank_id) && $routeParams.rlrank_id.length == 17)
          {
            authorise($routeParams.rlrank_id, 'Steam');
          }
          else
          {
            authorise($routeParams.rlrank_id, 'PSN');
          }
        })();

        function authorise(id, platform)
        {
          ApiSvc.authorise(id, platform)
            .then(function(response)
            {
              vm.profile = response.data.profile;
              getPlayerRanks(id, platform);
              getPlayerStats(id, platform);
              // getPlayerRating(vm.profile.rlrank_id, platform);
            }
          );
        }

        function getPlayerRanks(id, platform)
        {
          ApiSvc.getPlayerRanks(id, platform)
            .then(function(response)
            {
              vm.playlists = response.data.results;
            }
          );
        }

        function getPlayerStats(id, platform)
        {
          ApiSvc.getPlayerStats(id, platform)
            .then(function(response)
            {
              vm.stats = response.data.results;
            }
          );
        }

        function getPlayerRating(id)
        {
          ApiSvc.getPlayerRating(id)
            .then(function(response)
            {
              vm.ratings = response.data.results;
            }
          );
        }
    }]);
})();
