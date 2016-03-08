(function() {
  angular
    .module('app')
    .factory('SocketSvc', ['socketFactory', SocketSvc]);

  function SocketSvc(socketFactory)
  {
    'use strict';
    var socket = socketFactory();

    socket.forward('error');

    return socket;
  };
})();
