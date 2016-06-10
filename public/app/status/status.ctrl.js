(function() {
  angular
    .module('app')
    .controller('StatusController', ['ApiSvc', 'RouteSvc', 'TitleSvc', 'moment', '$interval', function(ApiSvc, RouteSvc, TitleSvc, moment, $interval) {
        'use strict';

        var vm = this;

        vm.goToProfile = goToProfile;

        (function()
        {
          TitleSvc.setTitle('Server Status');
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

        function goToProfile(url)
        {
          vm.showLoader = true;

          RouteSvc.goToProfile(url,
            function(err)
            {
              vm.profileError = err.message;
              vm.showLoader = false;
            }
          );
        }
    }]);
})();
