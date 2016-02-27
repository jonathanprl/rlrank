'use strict';

angular.module('app')
  .filter('rlPlaylist', function()
  {
    return function(input)
    {
      var playlists = {
        '10': '1v1',
        '11': '2v2',
        '12': '3v3 Solo',
        '13': '3v3 Team'
      };

      return playlists[input];
    };
  })
  .filter('rlTier', function()
  {
    return function(input)
    {
      var tiers = {
        '1': 'Prospect I',
        '2': 'Prospect II',
        '3': 'Prospect III',
        '4': 'Prospect Elite',
        '5': 'Challenger I',
        '6': 'Challenger II',
        '7': 'Challenger III',
        '8': 'Challenger Elite',
        '9': 'Rising Star',
        '10': 'Shooting Star',
        '11': 'All-Star',
        '12': 'Superstar',
        '13': 'Champion',
        '14': 'Super Champion',
        '15': 'Grand Champion'
      };

      return tiers[input] || 'Unranked';
    };
  });
