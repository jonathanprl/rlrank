(function() {
  angular
    .module('app')
    .controller('PagesController', ['RouteSvc', 'TitleSvc', 'ApiSvc', PagesController]);

  function PagesController(RouteSvc, TitleSvc, ApiSvc)
  {
    'use strict';

    var vm = this;

    vm.headerUrl = '/views/navbar/header';
    vm.pageTitle = TitleSvc.currentPage;

    (function() {
      ApiSvc.getRankTiers()
        .then(
          function(response)
          {
            vm.tierRanges = response.data.results;
          }
        );
    }());

  };
})();
