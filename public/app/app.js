angular
  .module('app', ['rlrank-templates', 'ngRoute', 'btford.socket-io', 'angular-google-analytics', 'angularMoment', 'djds4rce.angular-socialshare', 'ng-showdown', 'ngSanitize'])
  .config(['$routeProvider', '$locationProvider', '$compileProvider', app])
  .config(['AnalyticsProvider', analyticsProvider])
  .run(['$rootScope', 'TitleSvc', 'Analytics', '$FB', 'AdsenseTracker', run]);

function app($routeProvider, $locationProvider, $compileProvider)
{
  'use strict';

  $compileProvider.debugInfoEnabled(false);

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
      templateUrl: '/views/tiers/tiers',
      controller: 'TiersController as vm',
      data: {
        activeSection: 'tiers',
        pageTitle: 'Rocket League Ranking Tiers',
        pageDescription: 'Season 3 skill rating and MMR breakdown of current Rocket League ranking system. Find out when you will be promoted to the next tier or division.'
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
    .when('/u/:rlrank_id/:rlrank_id2', {
      templateUrl: '/views/profile/compare',
      controller: 'ProfileController as vm',
      activeSection: 'profile',
      showMMR: true
    })
    .when('/u/:rlrank_id', {
      templateUrl: '/views/profile/profile',
      controller: 'ProfileController as vm',
      activeSection: 'profile',
      showMMR: true
    })
    .when('/amazon/redirect/:code/:type', {
      templateUrl: '/views/amazon/redirect',
      controller: 'AmazonController as vm',
      activeSection: 'amazon',
      data: {
        pageTitle: 'default'
      }
    })
    .when('/mm/redirect/:code/:type', {
      templateUrl: '/views/amazon/mmredirect',
      controller: 'AmazonController as vm',
      activeSection: 'amazon',
      data: {
        pageTitle: 'default'
      }
    })
    .when('/blog/:seo_title?', {
      templateUrl: '/views/blog/blog',
      controller: 'BlogController as vm',
      activeSection: 'blog',
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
    })
    .disableAnalytics(window.location.hostname == 'localhost');
}

function run($rootScope, TitleSvc, Analytics, $FB, AdsenseTracker) {
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

      AdsenseTracker.isLoaded = false;
      Object.keys(window).filter(function(k) { return /google/.test(k) }).forEach(
        function(key) {
          delete(window[key]);
        }
      );
    }
  );

  $FB.init('1077927685606343');
}
