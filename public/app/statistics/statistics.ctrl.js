(function() {
  angular
    .module('app')
    .controller('LeaderboardController', ['ApiSvc', 'RouteSvc', 'TitleSvc', function(ApiSvc, RouteSvc, TitleSvc) {
        'use strict';

        var vm = this;

        (function() {
          TitleSvc.setTitle("Statistics");
        }());


    }]);
})();
