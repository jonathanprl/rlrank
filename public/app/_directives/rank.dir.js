angular
    .module('app')
    .directive('rankForm', ['ApiSvc', 'Analytics', '$location', rankForm])
    .directive('rankGraph', [rankGraph]);

function rankForm(ApiSvc, Analytics, $location)
{
  var directive = {
    restrict: 'E',
    templateUrl: '/views/widgets/rankForm',
    scope: {
      compare: '=',
      platform: '=?'
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

    scope.steamLogin = attr.steamLogin || false;

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
      ApiSvc.getProfile(scope.input, scope.platform.id)
        .then(
          function(response)
          {
            Analytics.trackEvent('profile', 'find', scope.input + '@' + scope.platform.id);

            if (scope.compare)
            {
              Analytics.trackEvent('profile', 'compare', scope.compare + '@' + scope.platform.id + ' & ' + response.data.rlrank_id + '@' + scope.platform.id);
              return $location.path('u/' + scope.compare + '/' + response.data.rlrank_id);
            }

            $location.path('u/' + response.data.rlrank_id);
          })
        .catch(
          function(err)
          {
            console.log(err);
            scope.profileError = err.data.msg;
            scope.showLoader = false;
          }
        );
    }
  }
}

function rankGraph()
{
  var directive = {
    restrict: 'E',
    scope: {
      playlists: '=',
      playlist: '='
    },
    link: linkFn
  };

  return directive;

  function linkFn(scope, element, attr, ctrl)
  {
    if(!scope.playlists) return false;

    var playlist = scope.playlists.filter(function(playlist) {
      return playlist._id == scope.playlist.playlist;
    })[0];

    if(!playlist) return false;

    var ranks = playlist.ranks.filter(function(rank, index) {
      return index > playlist.ranks.length - 20 ? true : false;
    });

    var values = ranks.map(function(rank) { return rank.mmr; });
    var dates = ranks.map(function(rank) {
      return moment(parseInt(rank._id.substring(0, 8), 16) * 1000).fromNow();
    });

    if (values.length < 2)
    {
      return false;
    }

    $(element).sparkline(values, {
      height: '30px',
      width: '60px',
      type: 'line',
      lineColor: '#45B29D',
      fillColor: null,
      lineWidth: 1,
      minSpotColor: '#E27A3F',
      maxSpotColor: '#E27A3F',
      highlightSpotColor: undefined,
      highlightLineColor: '#334D5C',
      spotRadius: 2,
      tooltipFormat: '<strong>{{y:value}}</strong> | {{offset:dates}}',
      tooltipValueLookups: {
        dates: dates
      }
    });
  }
}
