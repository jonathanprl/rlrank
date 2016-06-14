(function() {
  angular
    .module('app')
    .factory('AmazonSvc', ['$http', '$q', AmazonSvc]);

  function AmazonSvc($http, $q)
  {
    'use strict';

    return {
      getProduct: getProduct,
      getRedirectUrl: getRedirectUrl,
      shortcodes: shortcodes
    };

    function getProduct(code)
    {
      return $http.get('/api/amazon/product/' + encodeURIComponent(code));
    }

    function getRedirectUrl(asin)
    {
      return $http.get('/api/amazon/redirect/' + encodeURIComponent(asin));
    }

    function shortcodes(content, callback)
    {
      var matches = content.match(/\[AMAZON.*?\]/g);

      var defer = $q.defer();
      var promises = [];

      var codes = matches.map(function(match) {
        return match.split('"')[1];
      }).filter(function(item, pos, self) {
        return self.indexOf(item) == pos;
      });

      var products = {};

      angular.forEach(codes, function(code, index) {
        promises.push(
          getProduct(code)
            .then(function(response) {
              products[code] = response.data;
              defer.resolve();
            })
        );
      });

      $q.all(promises).then(function() {
        angular.forEach(matches, function(shortcode) {
          var code = shortcode.split('"')[1];
          content = replaceShortcode(content, shortcode, products[code]);
        });
        callback(null, content);
      });

      function replaceShortcode(content, shortcode, product)
      {
        if (shortcode.indexOf('AMAZON_PRICE=') > -1)
        {
          return content.replace(shortcode, '[' + product.price + '](' + product.link + ' "' + product.name + '")');
        }
        else if (shortcode.indexOf('AMAZON_PRICE_USED=') > -1)
        {
          return content.replace(shortcode, '[' + product.used_price + '](' + product.link + ' "' + product.name + '")');
        }
        else if (shortcode.indexOf('AMAZON_SOURCE=') > -1)
        {
          return content.replace(shortcode, '[' + product.source + '](' + product.link + ' "' + product.name + '")');
        }
      }
    }
  }
})();
