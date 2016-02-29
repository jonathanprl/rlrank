(function() {
  angular
    .module('app')
    .controller('StatusController', ['ApiSvc', 'RouteSvc', function(ApiSvc, RouteSvc) {
        'use strict';

        var vm = this;

        vm.router = RouteSvc;

        (function()
        {
          getStatus();
        })();

        function getStatus()
        {
          ApiSvc.getStatus()
            .then(function(response)
            {
              vm.regions = response.data.results;
            }
          );
        }
    }]);
})();
