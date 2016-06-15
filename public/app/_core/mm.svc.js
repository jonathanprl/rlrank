(function() {
  angular
    .module('app')
    .factory('MmSvc', ['$http', MmSvc]);

  function MmSvc($http)
  {
    'use strict';

    return {
      getStatus: getStatus
    };

    function getStatus()
    {
      return $http.get('/api/mm/status');
    }
  }

})();
