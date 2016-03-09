(function() {
  angular
    .module('app')
    .factory('SocketSvc', ['socketFactory', SocketSvc]);

  function SocketSvc(socketFactory)
  {
    'use strict';

    // return {
    //   profiles: profiles
    // };
    //
    // function profiles(profile)
    // {
    //   var socket = socketFactory({
    //     ioSocket: io.connect('/profiles')
    //   });
    //
    //   socket.emit('profile', profile);
    //
    //   return socket;
    // };
  };
})();
