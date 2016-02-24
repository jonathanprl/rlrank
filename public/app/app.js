angular
  .module('app', ['pianobase-templates', 'ngRoute', 'ngAudio', 'cfp.hotkeys'])
  .config(function($routeProvider, $locationProvider) {
      'use strict';

      // Remove hashes from URL
      $locationProvider.html5Mode(true);

      $routeProvider
        .when('/', {
          templateUrl: '/views/home/home',
          controller: 'HomeController as vm',
          activeSection: 'home'
        });
  });
