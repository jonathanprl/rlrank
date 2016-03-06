(function() {
  'use strict';
  angular
    .module('app')
    .directive('sparkline',
      function() {
        return {
          restrict: 'A',
          scope: {
            data: '=sparkline'
          },
          link: function (scope, element)
          {
            console.log(scope.data);
            $(element).sparkline(
              [scope.data],
              {
                type: 'line',
                width: '100%',
                height: '50px',
                lineColor: '#45B29D',
                fillColor: null,
                lineWidth: 1,
                minSpotColor: '#E27A3F',
                maxSpotColor: undefined,
                highlightSpotColor: '#E27A3F',
                highlightLineColor: '#334D5C',
                spotRadius: 2,
                drawNormalOnTop: false
              }
            );
          }
        };
      }
    ).directive('googleAdsense', function () {
      return {
        restrict: 'A',
        replace: true,
        templateUrl: '/views/ads',
        controller: function () {
          (adsbygoogle = window.adsbygoogle || []).push({});
        }
      };
    });
}());
