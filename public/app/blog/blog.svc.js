(function() {
  angular
    .module('app')
    .factory('BlogSvc', ['$http', BlogSvc]);

  function BlogSvc($http)
  {
    'use strict';

    return {
      getPosts: getPosts
    };

    function getPosts()
    {
      return $http.get('/api/blog/posts');
    }
  }
})();
