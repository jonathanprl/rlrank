angular
  .module('app', ['rlrank-templates', 'ngRoute'])
  .config(function($routeProvider, $locationProvider) {
      'use strict';

      // Remove hashes from URL
      $locationProvider.html5Mode(true);

      $routeProvider
        .when('/leaderboards', {
          templateUrl: '/views/leaderboard/leaderboard',
          controller: 'LeaderboardController as vm',
          activeSection: 'leaderboard'
        })
        .when('/:steam', {
          templateUrl: '/views/profile/profile',
          controller: 'ProfileController as vm',
          activeSection: 'profile'
        })
        .when('/', {
          templateUrl: '/views/home/home',
          controller: 'HomeController as vm',
          activeSection: 'home'
        });
  });
