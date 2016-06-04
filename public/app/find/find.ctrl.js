(function() {
  'use strict';
  angular
    .module('app')
    .controller('FindController', ['ApiSvc', '$routeParams', '$location', FindController]);

    function FindController(ApiSvc, $routeParams, $location)
    {
      ApiSvc.getProfile($routeParams.input, $routeParams.platform)
        .then(
          function(response)
          {
            if ($routeParams.input2 && $routeParams.platform2)
            {
              Analytics.trackEvent('profile', 'compare', $routeParams.input + '@' + $routeParams.platform + ' & ' + $routeParams.input2 + '@' + $routeParams.platform2);

              return ApiSvc.getProfile($routeParams.input2, $routeParams.platform2)
                .then(
                  function(response2)
                  {
                    return $location.path('u/' + response.data.rlrank_id + '/' + response2.data.rlrank_id);
                  })
                .catch(
                  function(err)
                  {
                    return $location.path('/');
                  }
                );
            }

            return $location.path('u/' + response.data.rlrank_id);
          })
        .catch(
          function(err)
          {
            return $location.path('/');
          }
        );
    }

}());
