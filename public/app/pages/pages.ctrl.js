(function() {
  angular
    .module('app')
    .controller('PagesController', ['RouteSvc', function(RouteSvc) {
        'use strict';

        var vm = this;

        vm.goToProfile = goToProfile;

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
