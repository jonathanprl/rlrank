(function() {
  'use strict';

  angular
      .module('app')
      .directive('mmProduct', ['AmazonSvc', 'Analytics', mmProduct])
      .directive('mmBanner', ['AmazonSvc', 'Analytics', mmBanner])
      .directive('mmProductClick', ['Analytics', mmProductClick])
      .directive('mmLoot', ['Analytics', mmLoot]);

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
      AmazonSvc.getProduct(attrs.code)
        .then(function(response) {
          scope.product = response.data;
          Analytics.trackEvent('amazon', 'impression', response.data.source);
        });
    }
  }

  function mmBanner(AmazonSvc, Analytics)
  {
    var directive = {
      restrict: 'E',
      templateUrl: '/views/amazon/banner',
      link: linkFn
    };

    return directive;

    function linkFn(scope, element, attrs)
    {
      AmazonSvc.getBanner(attrs.code, attrs.type)
        .then(function(response) {
          scope.banner = response.data;
          Analytics.trackEvent('amazon', 'impression', response.data.link);
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
