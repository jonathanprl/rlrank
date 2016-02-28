angular
  .module('app', ['rlrank-templates', 'ngRoute'])
  .config(function($routeProvider, $locationProvider) {
      'use strict';

      // Remove hashes from URL
      $locationProvider.html5Mode(true);

      $routeProvider
        .when('/:steamName', {
          templateUrl: '/views/home/home',
          controller: 'HomeController as vm',
          activeSection: 'home'
        });
  });
