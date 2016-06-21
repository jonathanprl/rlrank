(function() {
  angular
    .module('app')
    .controller('BlogController', ['BlogSvc', 'Analytics', 'AmazonSvc', 'TitleSvc', '$routeParams', BlogController]);

  function BlogController(BlogSvc, Analytics, AmazonSvc, TitleSvc, $routeParams)
  {
    'use strict';

    var vm = this;

    TitleSvc.setTitle('Blog');
    TitleSvc.setDescription('Rocket League articles featuring tips on how to build your Rocket League stats and climb the rankings, hardware and more.');

    BlogSvc.getPosts()
      .then(function(response) {
        vm.posts = response.data;

        if ($routeParams.seo_title)
        {
          vm.posts = vm.posts.filter(function(post) {
            return post.seo_title == $routeParams.seo_title;
          });
          TitleSvc.setTitle(vm.posts[0].title);
          TitleSvc.setDescription(vm.posts[0].content.substring(0,300));
        }

        angular.forEach(vm.posts, function(post, index) {
          AmazonSvc.shortcodes(post.content, function(err, content) {
            vm.posts[index].content = content;
          });
        });
      })
      .catch(function(err) {
        console.log(err);
      });
  }

})();
