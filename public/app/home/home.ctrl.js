(function() {
  angular
    .module('app')
    .controller('HomeController', function(RankSvc, $routeParams, $location, $cacheFactory) {
        'use strict';

        var vm = this;

        vm.goToProfile = goToProfile;
        vm.leaderboards = {};

        (function()
        {
          getAllLeaderboards();
        })();

        function goToProfile(url)
        {
          RankSvc.authorise(url)
            .then(function(response)
            {
              var profile = response.data.profile;

              var url = trimTrailingSlash(profile.url);

              if (url.indexOf('/id/') > -1)
              {
                $location.path(url.split('/').pop());
              }
              else
              {
                $location.path(profile.steamid);
              }
            }
          );
        }

        function getLeaderboard(playlist)
        {
          RankSvc.getLeaderboard(playlist)
            .then(function(response)
            {
              vm.leaderboards[playlist] = response.data.results;
            }
          );
        }

        function getAllLeaderboards()
        {
          getLeaderboard(10);
          getLeaderboard(11);
          getLeaderboard(12);
          getLeaderboard(13);
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
