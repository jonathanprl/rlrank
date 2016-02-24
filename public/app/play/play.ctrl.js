(function() {
  angular
    .module('app')
    .controller('PlayController', function(hotkeys, $interval, $timeout, PlaySvc) {
        'use strict';

        var vm = this;

        var song = ['j','k','le','u','k','l','x','kw','y','o',
                    'f','h','jq','t','h','j','l','h0','r','u',
                    'd','f','g9','e','f','g','l','f0','r','u',
                    'l','z','k0','j','j','k','l','kr',
                    'j','k','le','u','k','l','x','kw','y','o',
                    'f','h','jq','t','h','j','l','h0','r','u',
                    'f','g9','f','g','l','l0','r','u',
                    'l','z','k0','j','j','H','je','u','p',

                    'l','z','xt','o','z','xs','v','zw','y','o',
                    'h','ci','x','x','z','xu','a','h',
                    'j','k','le','u','k','l','x','vo','z','z',
                    'l','z','cy','p','v','x','z','xu','a','h',
                    'l','z','xt','o','z','xs','v','zw','y','o',
                    'h','bi','v','v','c','v','xu','s','h',
                    'j','k','le','u','k','l','x','vo','z','z',
                    'x','z','lq','z','l','k0','j','H','je','u','p'];

        vm.song = PlaySvc.pianobaseifySong(song);

        vm.currentNoteIndex = 0;
        vm.currentNote = vm.song[vm.currentNoteIndex];
        vm.keyPress = keyPress;

        var pressedKeys = [];
        function keyPress(note)
        {
          var currentNote = String(vm.currentNote);
          var characters = vm.currentNote.length;

          if (pressedKeys.length >= characters)
          {
            pressedKeys.splice(-characters, characters);
          }

          pressedKeys.push(note);

          pressedKeys.sort();

          var pressedString = pressedKeys.join('');

          console.log(pressedString);
          console.log(vm.currentNote);

          if (pressedString.length == characters && pressedString.indexOf(vm.currentNote) > -1)
          {
            vm.currentNoteIndex++;
            vm.currentNote = vm.song[vm.currentNoteIndex];
            pressedKeys = [];
          }
        }



    });
})();
