(function() {
  angular
    .module('app')
    .controller('ProfileController', ['$scope', 'ApiSvc', 'RouteSvc', '$routeParams', '$location', 'TitleSvc', 'SocketSvc', function($scope, ApiSvc, RouteSvc, $routeParams, $location, TitleSvc, SocketSvc) {
        'use strict';

        var vm = this;

        vm.authorise = authorise;
        vm.getPlayerRanks = getPlayerRanks;
        vm.leaderboards = {};
        vm.shareUrl = $location.absUrl();
        vm.router = RouteSvc;

        authorise($routeParams.rlrank_id);

        SocketSvc.forward('liveRank', $scope);

        $scope.$on('socket:liveRank', function (ev, data) {
          vm.liveRank = data;
        });

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

                SocketSvc.emit('profile', vm.profile);
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
