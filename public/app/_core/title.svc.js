(function() {
  'use strict';
  angular
    .module('app')
    .factory('TitleSvc', ['$window', TitleSvc]);

  function TitleSvc($window)
  {
    var base = ' - Rocket League Rank';
    var defaultTitle = 'Rocket League Rank - Rocket League Ranks, Player Stats, Player Comparison, and Player Leaderboards';
    var currentTitle = $window.document.title;

    return {
      currentTitle: currentTitle,
      setDefault: setDefault,
      setTitle: setTitle
    };

    function setDefault()
    {
      setTitle(defaultTitle);
    }

    function setTitle(title)
    {
      $window.document.title = title + base;
    }
  };
}());
