'use strict';

angular.module('app')
  .filter('rlPlaylist', function()
  {
    return function(input)
    {
      var playlists = {
        '0': 'Normal (All)',
        '1': '1v1 (Normal)',
        '2': '2v2 (Normal)',
        '3': '3v3 (Normal)',
        '4': '4v4 (Normal)',
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
        '0': 'Unranked',
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
  })
  .filter('rlRegion', function()
  {
    return function(input)
    {
      var regions = {
        'ASC': 'Asia SE Mainland',
        'EU': 'Europe',
        'JPN': 'Japan',
        'ME': 'Middle East',
        'nrt': 'Asia East',
        'OCE': 'Oceania',
        'SAM': 'South America',
        'USE': 'US East',
        'USW': 'US West'
      };

      return regions[input] || input;
    };
  })
  .filter('roman', function()
  {
    return function(input)
    {
      var regions = {
        '1': 'I',
        '2': 'II',
        '3': 'III',
        '4': 'IV',
        '5': 'V'
      };

      return regions[input] || input;
    };
  });
