angular
  .module('app', ['rlrank-templates', 'ngRoute', 'btford.socket-io', 'angular-google-analytics', 'angularMoment'])
  .config(['$routeProvider', '$locationProvider', app])
  .config(['AnalyticsProvider', analyticsProvider])
  .run(['Analytics', analytics]);

function app($routeProvider, $locationProvider)
{
  'use strict';

  // Remove hashes from URL
  $locationProvider.html5Mode(true);

  $routeProvider
  .when('/statistics', {
    templateUrl: '/views/statistics/statistics',
    controller: 'StatisticsController as vm',
    activeSection: 'statistics'
  })
  .when('/leaderboards', {
    templateUrl: '/views/leaderboard/leaderboard',
    controller: 'LeaderboardController as vm',
    activeSection: 'leaderboard'
  })
  .when('/status', {
    templateUrl: '/views/status/status',
    controller: 'StatusController as vm',
    activeSection: 'status'
  })
  .when('/about', {
    templateUrl: '/views/pages/about',
    controller: 'PagesController as vm',
    activeSection: 'about'
  })
  .when('/contact', {
    templateUrl: '/views/pages/contact',
    controller: 'PagesController as vm',
    activeSection: 'contact'
  })
  .when('/u/:rlrank_id/:platform', {
    templateUrl: '/views/profile/profile',
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
  .when('/u_mmr/:rlrank_id', {
    templateUrl: '/views/profile/profile',
    controller: 'ProfileController as vm',
    activeSection: 'profile',
    showMMR: true
  })
  .when('/', {
    templateUrl: '/views/home/home',
    controller: 'HomeController as vm',
    activeSection: 'home'
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

function analytics(Analytics) {}
