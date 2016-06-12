(function() {
  'use strict';

  angular
      .module('app')
      .directive('mmProduct', ['AmazonSvc', 'Analytics', mmProduct])
      .directive('mmProductClick', ['Analytics', mmProductClick]);

  function mmProduct(AmazonSvc, Analytics)
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
          Analytics.trackEvent('amazon', 'impression', response.data.source);
        });
    }
  }

  function mmProductClick(Analytics)
  {
    var directive = {
      restrict: 'A',
      scope: {
        product: '=mmProductClick'
      },
      link: linkFn
    };

    return directive;

    function linkFn(scope, element, attrs)
    {
      element.bind('click', function() {
        Analytics.trackEvent('amazon', 'click', scope.product.source);
      });
    }
  }

})();
