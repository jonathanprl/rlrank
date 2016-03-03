(function() {
  angular
    .module('app')
    .factory('RouteSvc', ['ApiSvc', '$location', function(ApiSvc, $location) {
        'use strict';

        return {
          goToProfile: goToProfile
        };

        function goToProfile(rlrankId, callback)
        {
          ApiSvc.authorise(rlrankId)
            .then(function(response)
            {
              var profile = response.data.profile;
              $location.path('u/' + profile.rlrank_id);
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
