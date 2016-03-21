(function() {
  angular
    .module('app')
    .controller('StatisticsController', ['ApiSvc', 'RouteSvc', 'TitleSvc', StatisticsController]);

  function StatisticsController(ApiSvc, RouteSvc, TitleSvc) {
    'use strict';

    var vm = this;

    (function() {
      TitleSvc.setTitle('Statistics');
      getTierThresholds();
    }());

    function getTierThresholds()
    {
      ApiSvc.getTierThresholds().then(
        function(response)
        {
          vm.tierThresholds = response.data.results;
        }
      );
    }
  };
})();
