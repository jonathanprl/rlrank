(function() {
  'use strict';

  angular
      .module('app')
      .directive('mmProduct', ['AmazonSvc', mmProduct]);

  function mmProduct(AmazonSvc)
  {
    var directive = {
      restrict: 'E',
      templateUrl: '/views/amazon/steelseries',
      link: linkFn
    };

    return directive;

    function linkFn(scope, element, attrs)
    {
      AmazonSvc.getProduct(attrs.asin)
        .then(function(response) {
          scope.product = response.data;
        });
    }

  }

})();
