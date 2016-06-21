(function() {
  angular
    .module('app')
    .controller('HomeController', ['ApiSvc', 'RouteSvc', 'TwitchSvc', 'BlogSvc', '$routeParams', '$location', 'Analytics', HomeController]);

  function HomeController(ApiSvc, RouteSvc, TwitchSvc, BlogSvc, $routeParams, $location, Analytics)
  {
    'use strict';

    var vm = this;

    vm.leaderboardPlaylists = [10, 11, 12, 13];

    (function()
    {
      getLeaderboards();
      getPopulation();
      getPopulationHistorical();
      getTwitchStreams();
      getAlerts();
      getPosts();
    })();

    function getLeaderboards()
    {
      ApiSvc.getLeaderboards(3)
        .then(function(response)
        {
          vm.leaderboards = response.data.results;
        }, function(err)
        {
          console.log(err.code);
        }
      );
    }

    function getAlerts()
    {
      ApiSvc.getAlerts()
        .then(function(response)
        {
          vm.alerts = response.data.results;
        }, function(err)
        {
          console.log(err.code);
        }
      );
    }

    function getPopulation()
    {
      ApiSvc.getPopulation().then(
        function(response)
        {
          vm.playlistPopulation = response.data.results;

          vm.totalPopulation = 0;
          angular.forEach(vm.playlistPopulation,
            function(playlist)
            {
              vm.totalPopulation += parseInt(playlist.players);
            }
          );
        }
      );
    }

    function getPopulationHistorical()
    {
      ApiSvc.getPopulationHistorical().then(
        function(response)
        {
          vm.populationHistorical = response.data.results;
        }
      );
    }

    function getTwitchStreams()
    {
      TwitchSvc.getStreams()
        .then(function(response) {
          vm.twitchStreams = response.data.streams;
        });
    }

    function getPosts()
    {
      BlogSvc.getPosts(['rocketleague', 'rocketleaguerank.com'])
        .then(function(response) {
          vm.blogPosts = response.data.filter(function(post) {
            return ~post.tags.indexOf('rocketleague');
          });
          vm.siteUpdates = response.data.filter(function(post) {
            return ~post.tags.indexOf('rocketleaguerank.com');
          });
        })
        .catch(function(err) {
          console.log(err);
        });
    }
  }
})();
