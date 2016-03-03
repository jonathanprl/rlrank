(function() {
  angular
    .module('app')
    .controller('PagesController', ['RouteSvc', 'TitleSvc', function(RouteSvc, TitleSvc) {
        'use strict';

        var vm = this;

        vm.goToProfile = goToProfile;

        TitleSvc.setDefault();

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
