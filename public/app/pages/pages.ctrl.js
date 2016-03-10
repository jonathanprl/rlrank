(function() {
  angular
    .module('app')
    .controller('PagesController', ['RouteSvc', 'TitleSvc', PagesController]);

  function PagesController(RouteSvc, TitleSvc)
  {
    'use strict';

    var vm = this;

    vm.headerUrl = '/views/navbar/header';
    vm.pageTitle = TitleSvc.currentPage;

  };
})();
