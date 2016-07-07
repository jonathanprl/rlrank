(function() {
  angular
    .module('app')
    .controller('ProfileController', ['$interval', '$timeout', '$scope', 'ApiSvc', 'RouteSvc', '$routeParams', '$location', 'TitleSvc', 'Analytics', ProfileController]);

  function ProfileController($interval, $timeout, $scope, ApiSvc, RouteSvc, $routeParams, $location, TitleSvc, Analytics)
  {
    'use strict';

    var vm = this;

    vm.changeTab = changeTab;
    vm.compare = false;
    vm.currentTab = ['s3', 's3'];
    vm.errors = [];
    vm.getPlayerRanks = getPlayerRanks;
    vm.leaderboards = {};
    vm.shareUrl = $location.absUrl();
    vm.router = RouteSvc;
    vm.players = [];
    vm.playlists = [0, 10, 11, 12, 13];

    if ($routeParams.rlrank_id2)
    {
      vm.compare = true;
    }

    ApiSvc.getAlerts()
      .then(function(response)
      {
        vm.alerts = response.data.results;
      }, function(err)
      {
        console.log(err.code);
      }
    );

    getPlayerDetails($routeParams.rlrank_id,
      function(err, player)
      {
        if (err)
        {
          return vm.errors.push(err);
        }

        vm.players[0] = player;
        TitleSvc.setTitle(player.profile.display_name);
        TitleSvc.setDescription(player.profile.display_name + ' ranking and statistics. Compare your own Rocket League rank with ' + player.profile.display_name + ' and view historical MMR, global leaderboards, rank tiers and server status.');

        if ($routeParams.rlrank_id2)
        {
          vm.comparison = true;
          getPlayerDetails($routeParams.rlrank_id2,
            function(err, player)
            {
              if (err)
              {
                return vm.errors.push(err);
              }

              vm.players[1] = player;
              TitleSvc.setTitle(vm.players[0].profile.display_name + ' vs ' + vm.players[1].profile.display_name);
              TitleSvc.setDescription(vm.players[0].profile.display_name + ' vs ' + vm.players[1].profile.display_name + ' ranking and statistics. Compare your own Rocket League rank with ' + vm.players[0].profile.display_name + ' and view historical MMR, global leaderboards, rank tiers and server status.');
              vm.shareText = vm.players[0].profile.display_name + ' vs ' + vm.players[1].profile.display_name + ' - Rocket League rank and stats lookup';
            }
          );
        }
        else
        {
          vm.shareText = player.profile.display_name + ' - Rocket League rank and stats lookup';
        }
      }
    );

    function getPlayerDetails(rlrank_id, callback)
    {
      var player = {};
      ApiSvc.getProfileById(rlrank_id)
        .then(
          function(response)
          {
            player.profile = response.data;

            var seasons = [2, 3];

            getPlayerRanks(player.profile,
              function(err, ranks)
              {
                if (err)
                {
                  return vm.errors.push(err);
                }

                player.s2 = {};
                player.s3 = {};

                player.s2.playlists = ranks.playlists.s2;
                player.s2.lastUpdated = ranks.lastUpdated.s2;

                player.s3.playlists = ranks.playlists.s3;
                player.s3.lastUpdated = ranks.lastUpdated.s3;

                ApiSvc.getPlayerRanksHistorical(rlrank_id)
                  .then(function(response) {
                    player.s2.playlistsHistorical = response.data.results.s2;
                    player.s3.playlistsHistorical = response.data.results.s3;
                    callback(null, player);
                  })
                  .catch(function(err) {
                    if (err)
                    {
                      return vm.errors.push(err);
                    }
                  });
              }
            );

            Analytics.trackEvent('profile', 'view', player.profile.display_name + '@' + player.profile.platform + ' ' + player.profile.rlrank_id);
          }
        ).catch(
          function(err)
          {
            if (err.data.error.code == 'not_found')
            {
              ApiSvc.authorise(rlrank_id, null)
                .then(
                  function(response)
                  {
                    getPlayerDetails(response.data.profile.rlrank_id,
                      function(err, player)
                      {
                        callback(null, player);
                      }
                    );
                  })
                .catch(
                  function(err)
                  {
                    callback('A profile could not be retrieved. Please try again later. Our developers have been notified.');
                  }
                );
            }
          }
        );
    }

    function getPlayerRanks(profile, callback)
    {
      ApiSvc.getPlayerRanks(profile.rlrank_id, profile.platform)
        .then(function(response)
        {
          var playlists = {
            s2: {},
            s3: {}
          };
          angular.forEach(vm.playlists,
            function(playlist)
            {
              angular.forEach(response.data.results,
                function(results, season)
                {
                  angular.forEach(results,
                    function(result)
                    {
                      if (result.playlist == playlist) playlists[season][playlist] = result;
                    }
                  );

                  if (!playlists[season][playlist]) playlists[season][playlist] = {playlist: playlist};
                }
              );
            }
          );

          var lastUpdated = {};
          angular.forEach(response.data.results, function(results, season) {
            angular.forEach(results, function(result) {
              if ('created_at' in result)
              {
                lastUpdated[season] = result.created_at;
                return false;
              }
            });
          });

          callback(null, {
            playlists: playlists,
            lastUpdated: lastUpdated
          });
        })
        .catch(function(err)
        {
          callback('Ranks could not be retrieved for "' + profile.display_name + '". Please try again later. Our developers have been notified.');
        }
      );
    }

    function getPlayerStats(profile, callback)
    {
      ApiSvc.getPlayerStats(profile.rlrank_id, profile.platform)
        .then(function(response)
        {
          callback(null, response.data.results);
        })
        .catch(function(err)
        {
          callback('Stats could not be retrieved for  "' + profile.display_name + '". Please try again later. Our developers have been notified.');
        }
      );
    }

    function changeTab(index, tab)
    {
      $timeout(function() {
        $scope.$apply(function() {
          vm.currentTab[index] = tab;
        });
      });
    }
  };
})();
