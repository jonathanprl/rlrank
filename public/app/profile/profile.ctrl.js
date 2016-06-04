(function() {
  angular
    .module('app')
    .controller('ProfileController', ['$interval', '$timeout', 'ApiSvc', 'RouteSvc', '$routeParams', '$location', 'TitleSvc', 'Analytics', '$scope', ProfileController]);

  function ProfileController($interval, $timeout, ApiSvc, RouteSvc, $routeParams, $location, TitleSvc, Analytics, $scope)
  {
    'use strict';

    var vm = this;

    vm.compare = false;
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

    getPlayerDetails($routeParams.rlrank_id,
      function(err, player)
      {
        if (err)
        {
          return vm.errors.push(err);
        }

        vm.players[0] = player;
        TitleSvc.setTitle(player.profile.display_name);

        if ($routeParams.rlrank_id2)
        {
          getPlayerDetails($routeParams.rlrank_id2,
            function(err, player)
            {
              if (err)
              {
                return vm.errors.push(err);
              }

              vm.players[1] = player;
              TitleSvc.setTitle(vm.players[0].profile.display_name + ' vs ' + vm.players[1].profile.display_name);
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

            getPlayerRanks(player.profile,
              function(err, ranks)
              {
                if (err)
                {
                  return vm.errors.push(err);
                }

                player.playlists = ranks.playlists;
                player.lastUpdated = ranks.lastUpdated;

                getPlayerStats(player.profile,
                  function(err, stats)
                  {
                    if (err)
                    {
                      return vm.errors.push(err);
                    }

                    player.stats = stats;
                    callback(null, player);
                  }
                );
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
          var playlists = {};
          angular.forEach(vm.playlists,
            function(playlist)
            {
              angular.forEach(response.data.results,
                function(result)
                {
                  if (result.playlist == playlist) playlists[playlist] = result;
                }
              );

              if (!playlists[playlist]) playlists[playlist] = {playlist: playlist};
            }
          );

          callback(null, {
            playlists: playlists,
            lastUpdated: response.data.results[0].created_at
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
  };
})();
