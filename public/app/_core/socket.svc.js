(function() {
  angular
    .module('app')
    .factory('SocketSvc', ['socketFactory', function(socketFactory) {
        'use strict';
        var socket = socketFactory();

        socket.forward('error');

        return socket;
    }]);
})();
