(function() {
  angular
    .module('app')
    .factory('TwitchSvc', ['$http', '$cacheFactory', TwitchSvc]);

  function TwitchSvc($http, $cacheFactory)
  {
    'use strict';

    var cache = $cacheFactory('twitch');

    return {
      getStreams: getStreams
    };
    
    function getStreams(id)
    {
      return $http.get('https://api.twitch.tv/kraken/streams?game=rocket league');
    }
  };
})();
