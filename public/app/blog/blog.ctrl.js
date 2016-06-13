(function() {
  angular
    .module('app')
    .controller('BlogController', ['BlogSvc', 'Analytics', BlogController]);

  function BlogController(BlogSvc, Analytics)
  {
    'use strict';

    var vm = this;

    BlogSvc.getPosts()
      .then(function(response) {
        vm.posts = response.data;
      })
      .catch(function(err) {
        console.log(err);
      });

  }

})();
