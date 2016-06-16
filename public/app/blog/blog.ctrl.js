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

        AmazonSvc.shortcodes(vm.posts[0].content, function(err, content) {
          vm.posts[0].content = content;
        });

        if ($routeParams.seo_title)
        {
          TitleSvc.setTitle(vm.posts[0].title);
          TitleSvc.setDescription(vm.posts[0].content.substring(0,300));
        }
        
        Analytics.trackEvent('blog', 'view', vm.posts[0].title);
      })
      .catch(function(err) {
        console.log(err);
      });
  }

})();
