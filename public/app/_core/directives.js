(function() {
  'use strict';

  angular
      .module('app')
      .directive('sparkline', [sparkline])
      .directive('discordButton', ['$window', 'Analytics', discordButton])
      .directive('steamOpenid', ['$window', 'Analytics', steamOpenid]);

  function sparkline()
  {
    var directive = {
      restrict: 'A',
      scope: {
        data: '=sparkline'
      },
      link: linkFn
    };

    return directive;

    function linkFn(scope, element, attr, ctrl)
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
  }

  function discordButton($window, Analytics)
  {
    var directive = {
      restrict: 'E',
      templateUrl: '/views/widgets/discord',
      link: linkFn
    };

    return directive;

    function linkFn(scope)
    {
      scope.discordAuth = function() {
        Analytics.trackEvent('discord', 'auth', 'bot button click');
        $window.open('https://discordapp.com/oauth2/authorize?client_id=189453138158157825&scope=bot&permissions=0', 'Discord Authentication', 'width=745,height=725');
      };
    }
  }

  function steamOpenid($window, Analytics)
  {
    var directive = {
      restrict: 'E',
      templateUrl: '/views/widgets/steam',
      link: linkFn
    };

    return directive;

    function linkFn(scope)
    {
      scope.steamAuth = function() {
        Analytics.trackEvent('steam', 'auth', 'openid click');
        $window.open('/steam/auth', 'Steam Authentication', 'width=900,height=725');
      };
    }
  }
}());
