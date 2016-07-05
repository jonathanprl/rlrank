(function() {
  angular
    .module('app')
    .controller('TiersController', ['RouteSvc', 'TitleSvc', 'ApiSvc', TiersController])
    .filter('multiplier', multiplier);

  function TiersController(RouteSvc, TitleSvc, ApiSvc)
  {
    'use strict';

    var vm = this;
    vm.tierRanges = {};
    vm.currentTab = 3;

    (function() {
      ApiSvc.getRankTiers(2)
        .then(
          function(response)
          {
            vm.tierRanges[2] = response.data.results;
          }
        );

      ApiSvc.getRankTiers(3)
        .then(
          function(response)
          {
            vm.tierRanges[3] = response.data.results;
          }
        );
    }());

  };

  function multiplier()
  {
    return function(input, tier) {
      var players = 0;

      if (tier >= 12)
      {
        players = input;
      }
      else if (tier >= 11)
      {
        players = input;
      }
      else if (tier >= 9)
      {
        players = input;
      }
      else if (tier >= 8)
      {
        players = input * 2;
      }
      else if (tier >= 7)
      {
        players = input * 4;
      }
      else if (tier >= 3)
      {
        players = input * 5;
      }
      else if (tier >= 1)
      {
        players = input * 4;
      }
      else
      {
        players = input * 6;
      }

      return Math.ceil(players) + ' players';
    }
  }
})();
