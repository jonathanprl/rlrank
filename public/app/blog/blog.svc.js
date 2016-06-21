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

    function getPosts(tags)
    {
      var queryString = '';

      if (typeof tags !== 'undefined')
      {
        queryString = '?tags=' + encodeURIComponent(tags.join(','));
      }

      return $http.get('/api/blog/posts' + queryString);

    }
  }
})();
