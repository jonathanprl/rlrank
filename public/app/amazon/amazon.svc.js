(function() {
  angular
    .module('app')
    .factory('AmazonSvc', ['$http', '$q', AmazonSvc]);

  function AmazonSvc($http, $q)
  {
    'use strict';

    return {
      getProduct: getProduct,
      getBanner: getBanner,
      getRedirectUrl: getRedirectUrl,
      shortcodes: shortcodes
    };

    function getProduct(code)
    {
      return $http.get('/api/amazon/product/' + encodeURIComponent(code));
    }

    function getBanner(code)
    {
      return $http.get('/api/amazon/banner/' + encodeURIComponent(code));
    }

    function getRedirectUrl(code, type)
    {
      return $http.get('/api/amazon/redirect/' + encodeURIComponent(code) + '/' + encodeURIComponent(type));
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
          return content.replace(shortcode, '<a href="' + product.link + '" title="' + product.name + '" rel="nofollow">' + product.price + '</a>');
        }
        else if (shortcode.indexOf('AMAZON_PRICE_USED=') > -1)
        {
          return content.replace(shortcode, '<a href="' + product.link + '" title="' + product.name + '" rel="nofollow">' + product.used_price + '</a>');
        }
        else if (shortcode.indexOf('AMAZON_SOURCE=') > -1)
        {
          return content.replace(shortcode, '<a href="' + product.link + '" title="' + product.name + '" rel="nofollow">' + product.source + '</a>');
        }
      }
    }
  }
})();
