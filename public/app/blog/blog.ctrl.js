(function() {
  angular
    .module('app')
    .controller('BlogController', ['BlogSvc', 'Analytics', 'AmazonSvc', BlogController]);

  function BlogController(BlogSvc, Analytics, AmazonSvc)
  {
    'use strict';

    var vm = this;

    BlogSvc.getPosts()
      .then(function(response) {
        vm.posts = response.data;

        AmazonSvc.shortcodes(vm.posts[0].content, function(err, content) {
          vm.posts[0].content = content;
        });
      })
      .catch(function(err) {
        console.log(err);
      });
  }

})();
