(function() {
  angular
    .module('app')
    .controller('StatisticsController', ['ApiSvc', 'RouteSvc', 'TitleSvc', function(ApiSvc, RouteSvc, TitleSvc) {
        'use strict';

        var vm = this;

        (function() {
          TitleSvc.setTitle("Statistics");
        }());


    }]);
})();
