(function() {
  angular
    .module('app')
    .factory('RouteSvc', ['ApiSvc', '$location', function(ApiSvc, $location) {
        'use strict';

        return {
          goToProfile: goToProfile
        };

        function goToProfile(url, callback)
        {
          ApiSvc.authorise(url)
            .then(function(response)
            {
              var profile = response.data.profile;

              var url = _trimTrailingSlash(profile.url);

              if (url.indexOf('/id/') > -1)
              {
                $location.path(url.split('/').pop());
              }
              else
              {
                $location.path(profile.steamid);
              }
            },
            function(err)
            {
              callback(err.data);
            }
          );
        }

        function _trimTrailingSlash(s)
        {
          if (s[s.length - 1] == "/")
          {
            s = s.slice(0, -1);
            return _trimTrailingSlash(s);
          }
          else
          {
            return s;
          }
        }
    }]);
})();
