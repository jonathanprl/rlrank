(function() {
  'use strict';
  angular
    .module('app')
    .factory('TitleSvc', ['$window', function($window)
    {
      var defaultTitle = "RocketLeagueRank.com - View & Share your Rocket League MMR!";
      var base = " - RocketLeagueRank.com";

      return {
        setTitle: setTitle,
        setDefault: setDefault
      }

      function setTitle(title)
      {
        $window.document.title = title + base;
      }

      function setDefault()
      {
        $window.document.title = defaultTitle;
      }
    }]);
}());
