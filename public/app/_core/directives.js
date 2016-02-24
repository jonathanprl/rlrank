'use strict';

angular.module('app')
  .directive('note', function($timeout, $interval, hotkeys) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs)
      {
        element.bind('mousedown', keyPress);

        element.bind('mouseup', function()
        {
          element.removeClass('pressed');
        });

        var combo = String(attrs.hotkey);

        switch (attrs.hotkey)
        {
          case "EXCL":
            combo = "!";break;
          case "QUOT":
            combo = '"';break;
          case "PERC":
            combo = '%';break;
          case "CHEV":
            combo = "^";break;
          case "OBKT":
            combo = "(";break;
          case "ATRX":
            combo = "*";break;
        }

        hotkeys.add({
          combo: combo,
          callback: function(event) {
            keyPress(combo);
          }
        });

        function keyPress(combo)
        {
          scope.vm.keyPress(combo);
          
          element.addClass('pressed');
          playNote(attrs.note);

          $timeout(function()
          {
            element.removeClass('pressed');
          }, 100)
        }

        function playNote(key)
        {

          var audio = new Audio('mp3/Piano.ff.' + key + '.mp3');
          audio.play();

          var volumeChange = $interval(function()
          {
            var newVolume = audio.volume - 0.005;

            if(newVolume < 0)
            {
              audio.volume = 0;
              $interval.cancel(volumeChange);
              return;
            }

            audio.volume = newVolume;
          }, 10);
        }
      }
    };
  });
