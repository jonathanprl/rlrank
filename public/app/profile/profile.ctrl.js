(function() {
  angular
    .module('app')
    .controller('ProfileController', ['$interval', 'ApiSvc', 'RouteSvc', '$routeParams', '$location', 'TitleSvc', 'SocketSvc', function($interval, ApiSvc, RouteSvc, $routeParams, $location, TitleSvc, SocketSvc) {
        'use strict';

        var vm = this;

        vm.authorise = authorise;
        vm.getPlayerRanks = getPlayerRanks;
        vm.leaderboards = {};
        vm.liveRank = {};
        vm.shareUrl = $location.absUrl();
        vm.router = RouteSvc;

        if ($routeParams.platform)
        {
          getPlayerRanks($routeParams.rlrank_id, $routeParams.platform);
          getPlayerStats($routeParams.rlrank_id, $routeParams.platform);
        }
        else
        {
          authorise($routeParams.rlrank_id);
        }

        // SocketSvc.forward('liveRank', $scope);
        //
        // $scope.$on('socket:liveRank', function (ev, data) {
        //   vm.liveRank = data;
        // });

        $interval(
          function()
          {
            // TODO: REAL-TIME WITH DB VIA SOCKET.IO
            //!£!££
            var oldRanks = angular.copy(vm.playlists);
            getPlayerRanks(vm.profile.rlrank_id, vm.profile.platform,
              function(newRanks)
              {
                angular.forEach(oldRanks,
                  function(oldRank)
                  {
                    angular.forEach(newRanks,
                      function(newRank)
                      {
                        if (newRank.playlist == oldRank.playlist)
                        {
                          if (newRank.mmr > oldRank.mmr)
                          {
                            vm.liveRank[newRank.playlist] = newRank.mmr - oldRank.mmr;
                          }
                          else if (newRank.mmr < oldRank.mmr)
                          {
                            vm.liveRank[newRank.playlist] = newRank.mmr - oldRank.mmr;
                          }
                        }
                      }
                    );
                  }
                )
              }
            );
          }, '60000'
        );

        function authorise(input)
        {
          ApiSvc.authorise(input)
            .then(
              function(response)
              {
                vm.profile = response.data.profile;
                getPlayerRanks(vm.profile.rlrank_id, vm.profile.platform);
                getPlayerStats(vm.profile.rlrank_id, vm.profile.platform);

                TitleSvc.setTitle(vm.profile.username);
              })
            .catch(
              function(err)
              {
                $location.path('/');
              }
            );
        }

        function getPlayerRanks(id, platform, callback)
        {
          ApiSvc.getPlayerRanks(id, platform)
            .then(function(response)
            {
              vm.playlists = response.data.results;

              if (callback)
              {
                callback(response.data.results);
              }
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
            }
          );
        }
    }]);
})();
