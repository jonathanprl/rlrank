(function() {
  angular
    .module('app')
    .controller('AmazonController', ['AmazonSvc', '$routeParams', '$window', 'Analytics', AmazonController]);

  function AmazonController(AmazonSvc, $routeParams, $window, Analytics)
  {
    'use strict';

    var vm = this;

    AmazonSvc.getRedirectUrl($routeParams.code, $routeParams.type)
      .then(function(response) {
        $window.location = response.data;
      });

  }

})();
