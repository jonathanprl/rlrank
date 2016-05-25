(function() {
  angular
    .module('app')
    .controller('ProfileController', ['$interval', '$timeout', 'ApiSvc', 'RouteSvc', '$routeParams', '$location', 'TitleSvc', 'Analytics', '$scope', ProfileController]);

  function ProfileController($interval, $timeout, ApiSvc, RouteSvc, $routeParams, $location, TitleSvc, Analytics, $scope)
  {
    'use strict';

    var vm = this;

    vm.getPlayerRanks = getPlayerRanks;
    vm.leaderboards = {};
    vm.shareUrl = $location.absUrl();
    vm.router = RouteSvc;

    ApiSvc.getProfile($routeParams.rlrank_id)
      .then(
        function(response)
        {
          vm.profile = response.data.results;

          getPlayerRanks(vm.profile.rlrank_id, vm.profile.hash, vm.profile.platform);
          getPlayerStats(vm.profile.rlrank_id, vm.profile.hash, vm.profile.platform);

          TitleSvc.setTitle(vm.profile.display_name);
          Analytics.trackEvent('profile', 'view', vm.profile.display_name + '@' + vm.profile.platform + ' ' + vm.profile.rlrank_id);
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
                  vm.error = 'There was a problem retrieving your profile. Please try again later. Our developers have been notified.';
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
          vm.lastUpdated = vm.playlists[0].created_at;
        })
        .catch(function(err)
        {
          vm.error = 'There was a problem retrieving your rank. Please try again later. Our developers have been notified.';
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
          vm.error = 'There was a problem retrieving your stats. Please try again later. Our developers have been notified.';
        }
      );
    }
  };
})();
