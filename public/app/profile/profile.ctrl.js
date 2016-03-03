(function() {
  angular
    .module('app')
    .controller('ProfileController', ['ApiSvc', 'RouteSvc', '$routeParams', '$location', 'TitleSvc', function(ApiSvc, RouteSvc, $routeParams, $location, TitleSvc) {
        'use strict';

        var vm = this;

        vm.authorise = authorise;
        vm.getPlayerRanks = getPlayerRanks;
        vm.leaderboards = {};
        vm.shareUrl = $location.absUrl();
        vm.router = RouteSvc;

        authorise($routeParams.rlrank_id);

        function authorise(input)
        {
          ApiSvc.authorise(input)
            .then(
              function(response)
              {
                vm.profile = response.data.profile;
                getPlayerRanks(vm.profile.rlrank_id, vm.profile.platform);
                getPlayerStats(vm.profile.rlrank_id, vm.profile.platform);
                // getPlayerRating(vm.profile.rlrank_id, platform);

                TitleSvc.setTitle(vm.profile.username);
              })
            .catch(
              function(err)
              {
                $location.path('/');
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
