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
            var data = [];
            var labels = {};
            angular.forEach(scope.data,
              function(datum, index)
              {
                data.push(Math.ceil(datum.players));
                labels[index] = customHourToHuman(datum.hour);
              }
            );

            $(element).sparkline(
              data,
              {
                type: 'line',
                width: element.parent()[0].offsetWidth - 30 + 'px',
                height: '50px',
                lineColor: '#45B29D',
                fillColor: null,
                lineWidth: 1,
                minSpotColor: '#E27A3F',
                maxSpotColor: undefined,
                highlightSpotColor: '#E27A3F',
                highlightLineColor: '#334D5C',
                spotRadius: 2,
                drawNormalOnTop: false,
                tooltipFormat: '{{offset:names}} | Players Online: {{y:value}}',
                tooltipValueLookups: {
                  names: labels
                }
              }
            );

            function customHourToHuman(custom)
            {
              return custom[0] + custom[1] + '/' + custom[2] + custom[3] + ' ' + custom[4] + custom[5] + ':00';
            }
          }
        };
      }
    );
}());
