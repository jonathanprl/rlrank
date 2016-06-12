(function() {
  angular
    .module('app')
    .controller('AmazonController', ['AmazonSvc', '$routeParams', '$window', 'Analytics', AmazonController]);

  function AmazonController(AmazonSvc, $routeParams, $window, Analytics)
  {
    'use strict';

    var vm = this;

    Analytics.trackEvent('amazon', 'click', $routeParams.asin);
    AmazonSvc.getRedirectUrl($routeParams.asin)
      .then(function(response) {
        Analytics.trackEvent('amazon', 'redirect', response.data);
        $window.location = response.data;
      });

  }

})();
