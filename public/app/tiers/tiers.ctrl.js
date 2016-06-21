(function() {
  angular
    .module('app')
    .controller('TiersController', ['RouteSvc', 'TitleSvc', 'ApiSvc', TiersController]);

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
})();
