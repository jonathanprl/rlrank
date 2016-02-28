(function() {
  angular
    .module('app')
    .controller('ProfileController', function(ProfileSvc, $routeParams, $location, $cacheFactory) {
        'use strict';

        var vm = this;

        vm.authorise = authorise;
        vm.getPlayerRanks = getPlayerRanks;
        vm.leaderboards = {};
        vm.shareUrl = $location.absUrl();

        (function()
        {
          if (!isNaN(parseFloat($routeParams.steam)) && isFinite($routeParams.steam) && $routeParams.steam.length == 17)
          {
            authorise("https://steamcommunity.com/profiles/" + $routeParams.steam);
          }
          else
          {
            authorise("https://steamcommunity.com/id/" + $routeParams.steam);
          }
        })();

        function authorise(url)
        {
          ProfileSvc.authorise(url)
            .then(function(response)
            {
              vm.profile = response.data.profile;
              return getPlayerRanks(vm.profile.steamid);
            }
          );
        }

        function getPlayerRanks(id)
        {
          ProfileSvc.getPlayerRanks(id)
            .then(function(response)
            {
              vm.playlists = response.data.results;
            }
          );
        }

        function trimTrailingSlash(s)
        {
          if (s[s.length - 1] == "/")
          {
            s = s.slice(0, -1);
            return trimTrailingSlash(s);
          }
          else
          {
            return s;
          }
        }
    });
})();
