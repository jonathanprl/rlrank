angular
    .module('app')
    .directive('rankForm', ['ApiSvc', 'Analytics', '$location', rankForm]);

function rankForm(ApiSvc, Analytics, $location)
{
  var directive = {
    restrict: 'E',
    templateUrl: '/views/widgets/rankForm',
    scope: {
      compare: '=',
      platform: '='
    },
    link: linkFn
  };

  return directive;

  function linkFn(scope, element, attr, ctrl)
  {
    scope.goToProfile = goToProfile;
    scope.setPlatform = setPlatform;

    scope.buttonText = attr.buttonText || 'Get Ranks & Stats';
    scope.placeholder = {
      'steam': 'Enter a Steam profile URL, ID or name',
      'psn': 'Enter a PSN username',
      'xbox': 'Enter a Xbox Live gamertag'
    };

    if (scope.platform)
    {
      setPlatform(scope.platform);
    }
    else
    {
      scope.platform = {id: 'steam', name: 'Steam'};
    }

    function setPlatform(platform)
    {
      if (platform == 'psn')
      {
        scope.platform = {id: 'psn', name: 'Playstation'};
      }
      else
      {
        scope.platform = {id: platform, name: platform.charAt(0).toUpperCase() + platform.slice(1)};
      }
    }

    function goToProfile()
    {
      scope.showLoader = true;
      ApiSvc.authorise(scope.input, scope.platform.id)
        .then(
          function(response)
          {
            Analytics.trackEvent('profile', 'find', scope.input + '@' + scope.platform.id);

            if (scope.compare)
            {
              Analytics.trackEvent('profile', 'compare', scope.compare + '@' + scope.platform.id + ' & ' + response.data.profile.rlrank_id + '@' + scope.platform.id);
              return $location.path('u/' + scope.compare + '/' + response.data.profile.rlrank_id);
            }

            $location.path('u/' + response.data.profile.rlrank_id);
          })
        .catch(
          function(err)
          {
            scope.profileError = err.data.message;
            scope.showLoader = false;
          }
        );
    }
  }
}
