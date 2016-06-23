(function() {
  angular
    .module('app')
    .controller('StatusController', ['ApiSvc', 'moment', '$interval', function(ApiSvc, moment, $interval) {
        'use strict';

        var vm = this;

        (function()
        {
          getStatus();
          $interval(function() {
            getStatus();
          }, '60000');
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
