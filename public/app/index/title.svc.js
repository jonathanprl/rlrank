(function() {
  'use strict';
  angular
    .module('app')
    .factory('TitleSvc', ['$window', function($window)
    {
      var defaultTitle = "Rocket League Rank - View & share your Rocket League rank and stats!";
      var base = " - Rocket League Rank";

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
