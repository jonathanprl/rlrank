(function() {
  angular
    .module('app')
    .controller('ProfileController', ['$interval', '$timeout', 'ApiSvc', 'RouteSvc', '$routeParams', '$location', 'TitleSvc', 'Analytics', 'BlogSvc', ProfileController]);

  function ProfileController($interval, $timeout, ApiSvc, RouteSvc, $routeParams, $location, TitleSvc, Analytics, BlogSvc)
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

    BlogSvc.getPosts()
      .then(function(response) {
        vm.latestPost = response.data[0];
      })
      .catch(function(err) {
        console.log(err);
      });

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

                ApiSvc.getPlayerRanksHistorical(rlrank_id, 3)
                  .then(function(response) {
                    player.playlistsHistorical = response.data.results;
                  })
                  .catch(function(err) {
                    if (err)
                    {
                      return vm.errors.push(err);
                    }
                  });

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

          var lastUpdated = null;
          angular.forEach(response.data.results, function(result) {
            if ('created_at' in result)
            {
              lastUpdated = result.created_at;
              return false;
            }
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
  };
})();
