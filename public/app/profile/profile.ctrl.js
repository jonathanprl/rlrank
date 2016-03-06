(function() {
  angular
    .module('app')
    .controller('ProfileController', ['$interval', 'ApiSvc', 'RouteSvc', '$routeParams', '$location', 'TitleSvc', 'SocketSvc', function($interval, ApiSvc, RouteSvc, $routeParams, $location, TitleSvc, SocketSvc) {
        'use strict';

        var vm = this;

        vm.getPlayerRanks = getPlayerRanks;
        vm.leaderboards = {};
        vm.liveRank = {};
        vm.shareUrl = $location.absUrl();
        vm.router = RouteSvc;

        // SocketSvc.forward('liveRank', $scope);
        //
        // $scope.$on('socket:liveRank', function (ev, data) {
        //   vm.liveRank = data;
        // });

        ApiSvc.getProfile($routeParams.rlrank_id)
          .then(
            function(response)
            {
              vm.profile = response.data.results;

              getPlayerRanks(vm.profile.rlrank_id, vm.profile.hash, vm.profile.platform);
              getPlayerStats(vm.profile.rlrank_id, vm.profile.hash, vm.profile.platform);
            }
          ).catch(
            function(err)
            {
              if (err.data.error.code == 'not_found')
              {
                ApiSvc.authorise($routeParams.rlrank_id, null)
                  .then(
                    function(response)
                    {
                      $location.path('/u/' + response.data.profile.rlrank_id);
                    })
                  .catch(
                    function(err)
                    {
                      $location.path('/');
                    }
                  );
              }
            }
          );

        function getPlayerRanks(id, platform)
        {
          ApiSvc.getPlayerRanks(id, platform)
            .then(function(response)
            {
              vm.playlists = response.data.results;
            })
            .catch(function(err)
            {
              $location.path('/');
            }
          );
        }

        function getPlayerStats(id, platform)
        {
          ApiSvc.getPlayerStats(id, platform)
            .then(function(response)
            {
              vm.stats = response.data.results;
            })
            .catch(function(err)
            {
              $location.path('/');
            }
          );
        }
    }]);
})();
