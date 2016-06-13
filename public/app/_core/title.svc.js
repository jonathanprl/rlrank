(function() {
  'use strict';
  angular
    .module('app')
    .factory('TitleSvc', ['$window', TitleSvc]);

  function TitleSvc($window)
  {
    var base = ' - Rocket League Rank';
    var defaultTitle = 'Rocket League Ranks, Stats, MMR, Leaderboards and much more!';

    var defaultDescription = 'Rocket League Ranks, Stats, Comparison, Leaderboards and more! Look up your in-game rank and stats, historical MMR, global leaderboards, rank tiers and server status.';

    var currentTitle = $window.document.title;

    return {
      currentTitle: currentTitle,
      setDefault: setDefault,
      setTitle: setTitle,
      setDescription: setDescription
    };

    function setDefault()
    {
      setTitle(defaultTitle);
      setDescription(defaultDescription);
    }

    function setTitle(title)
    {
      $window.document.title = title + base;
    }

    function setDescription(description)
    {
      $('meta[name="description"]').attr('content', description);
    }
  };
}());
