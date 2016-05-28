angular
  .module('app', ['rlrank-templates', 'ngRoute', 'btford.socket-io', 'angular-google-analytics', 'angularMoment'])
  .config(['$routeProvider', '$locationProvider', app])
  .config(['AnalyticsProvider', analyticsProvider])
  .run(['$rootScope', 'TitleSvc', routeChange])
  .run(['Analytics', analytics]);

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
        pageTitle: 'Leaderboards'
      }
    })
    .when('/status', {
      templateUrl: '/views/status/status',
      controller: 'StatusController as vm',
      activeSection: 'status',
      data: {
        pageTitle: 'Server Status'
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
    .when('/statistics', {
      templateUrl: '/views/statistics/statistics',
      controller: 'StatisticsController as vm',
      data: {
        activeSection: 'statistics',
        pageTitle: 'Statistics'
      }
    })
    .when('/u/:rlrank_id/:rlrank_id2?', {
      templateUrl: '/views/profile/profile',
      controller: 'ProfileController as vm',
      activeSection: 'profile',
      showMMR: true
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

function routeChange($rootScope, TitleSvc)
{
  var routeChange = $rootScope.$on('$routeChangeStart',
    function(event, next, current)
    {
      if ('data' in next && 'pageTitle' in next.data && next.data.pageTitle != 'default')
      {
        TitleSvc.setTitle(next.data.pageTitle);
      }
      else
      {
        TitleSvc.setDefault();
      }
    }
  );
}

function analytics(Analytics) {}
