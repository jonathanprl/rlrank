(function() {
  angular
    .module('app')
    .factory('AmazonSvc', ['$http', AmazonSvc]);

  function AmazonSvc($http)
  {
    'use strict';

    return {
      getProduct: getProduct,
      getRedirectUrl: getRedirectUrl
    };

    function getProduct(asin)
    {
      return $http.get('/api/amazon/product/' + encodeURIComponent(asin));
    }

    function getRedirectUrl(asin)
    {
      return $http.get('/api/amazon/redirect/' + encodeURIComponent(asin));
    }
  }
})();
