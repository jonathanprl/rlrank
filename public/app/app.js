angular
  .module('app', ['rlrank-templates', 'ngRoute', 'btford.socket-io', 'angular-google-analytics', 'angularMoment', 'djds4rce.angular-socialshare', 'spAdsense'])
  .config(['$routeProvider', '$locationProvider', app])
  .config(['AnalyticsProvider', analyticsProvider])
  .run(['$rootScope', 'TitleSvc', 'Analytics', '$FB', run]);

function app($routeProvider, $locationProvider)
{
  'use strict';

  // Remove hashes from URL
  $locationProvider.html5Mode(true);

  $routeProvider
    .when('/leaderboards', {
      templateUrl: '/views/leaderboard/leaderboard',
      controller: 'LeaderboardController as vm',
      activeSection: 'leaderboard',
      data: {
        pageTitle: 'Global Leaderboards',
        pageDescription: 'Global top 200 Rocket League players MMR, ranks and statistics. Compare your own rank with the leaders by viewing their profiles!'
      }
    })
    .when('/status', {
      templateUrl: '/views/status/status',
      controller: 'StatusController as vm',
      activeSection: 'status',
      data: {
        pageTitle: 'Server Status',
        pageDescription: 'Status of the official Rocket League servers.'
      }
    })
    .when('/about', {
      templateUrl: '/views/pages/about',
      controller: 'PagesController as vm',
      activeSection: 'about',
      data: {
        pageTitle: 'About'
      }
    })
    .when('/contact', {
      templateUrl: '/views/pages/contact',
      controller: 'PagesController as vm',
      data: {
        activeSection: 'contact',
        pageTitle: 'Contact'
      }
    })
    .when('/advertise', {
      templateUrl: '/views/pages/advertise',
      controller: 'PagesController as vm',
      data: {
        activeSection: 'advertise',
        pageTitle: 'Advertise'
      }
    })
    .when('/faq', {
      templateUrl: '/views/pages/faq',
      controller: 'PagesController as vm',
      data: {
        activeSection: 'faq',
        pageTitle: 'Frequently Asked Questions'
      }
    })
    .when('/privacy', {
      templateUrl: '/views/pages/privacy',
      controller: 'PagesController as vm',
      data: {
        activeSection: 'privacy',
        pageTitle: 'Privacy'
      }
    })
    .when('/rank-tiers', {
      templateUrl: '/views/pages/ranks',
      controller: 'PagesController as vm',
      data: {
        activeSection: 'ranks',
        pageTitle: 'Rocket League Ranking Tiers',
        pageDescription: 'Skill rating and MMR breakdown of current Rocket League ranking system. Find out when you will be promoted to the next tier or division.'
      }
    })
    .when('/statistics', {
      templateUrl: '/views/statistics/statistics',
      controller: 'StatisticsController as vm',
      data: {
        activeSection: 'statistics',
        pageTitle: 'Statistics'
      }
    })
    .when('/find/:input/:platform', {
      templateUrl: '/views/profile/profile',
      controller: 'FindController as vm',
      activeSection: 'profile',
      showMMR: true
    })
    .when('/u/:rlrank_id/:rlrank_id2?', {
      templateUrl: '/views/profile/profile',
      controller: 'ProfileController as vm',
      activeSection: 'profile',
      showMMR: true
    })
    .when('/amazon/redirect/:asin', {
      templateUrl: '/views/amazon/redirect',
      controller: 'AmazonController as vm',
      activeSection: 'amazon',
      data: {
        pageTitle: 'default'
      }
    })
    .when('/', {
      templateUrl: '/views/home/home',
      controller: 'HomeController as vm',
      activeSection: 'home',
      data: {
        pageTitle: 'default'
      }
    })
    .otherwise({
      templateUrl: '/views/home/home',
      controller: 'HomeController as vm',
      activeSection: 'home',
      data: {
        pageTitle: 'default'
      }
    });
};

function analyticsProvider(AnalyticsProvider)
{
  AnalyticsProvider
    .setAccount({
      tracker: 'UA-74393698-1',
      trackEvent: true,
    });
}

function run($rootScope, TitleSvc, Analytics, $FB) {
  $rootScope.$on('$routeChangeStart',
    function(event, next, current)
    {
      if ('data' in next && 'pageDescription' in next.data && next.data.pageDescription != 'default')
      {
        TitleSvc.setDescription(next.data.pageDescription);
      }

      if ('data' in next && 'pageTitle' in next.data && next.data.pageTitle != 'default')
      {
        TitleSvc.setTitle(next.data.pageTitle);
      }
      else
      {
        TitleSvc.setDefault();
      }

      Object.keys(window).filter(function(k) { return k.indexOf('google') >= 0 }).forEach(
        function(key) {
          delete(window[key]);
        }
      );
    }
  );

  $FB.init('1077927685606343');
}
