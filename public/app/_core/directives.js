(function() {
  'use strict';
  angular
    .module('app')
    .directive('sparkline',
      function() {
        return {
          restrict: 'A',
          link: function (scope, element)
          {
            $(element).sparkline(
              [5,6,7,9,9,5,3,2,2,4,6,7,5,6,7,9,9,5,3,2,9,9,5,3,2,2,4,6,7,5,6,7,9,9,5,3,2,2,4,6,7,5,6,7,9,9,5,3,2,2,4,6,7,5,6,7,9,9,5,3,2,2,4,6,7,4],
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
    );
}());
