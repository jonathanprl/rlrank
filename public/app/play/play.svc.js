(function() {
  angular
    .module('app')
    .factory('PlaySvc', function(hotkeys, $interval, $timeout) {
        'use strict';

        return {
          pianobaseifySong: pianobaseifySong
        };

        // Move to server
        function pianobaseifySong(song)
        {
          angular.forEach(song, function(note, noteIndex)
          {
            var finishedNote = note;

            if (note.length > 1)
            {
              var letters = [],
                  numbers = [],
                  specials = [];

              angular.forEach(note, function(character)
              {
                if (isLetter(character))
                {
                  letters.push(character);
                }
                else if(isNumeric(character))
                {
                  numbers.push(character);
                }
                else
                {
                  specials.push(character);
                }
              });

              letters.sort();
              numbers.sort();
              specials.sort();

              finishedNote = specials.concat(numbers.concat(letters));
              finishedNote = finishedNote.join('');
            }

            song[noteIndex] = finishedNote;
          });

          return song;
        }

        function isNumeric(n) {
          return !isNaN(parseFloat(n)) && isFinite(n);
        }

        function isLetter(str) {
          return str.match(/[a-z]/i);
        }

    });
})();
