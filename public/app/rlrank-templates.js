angular.module("rlrank-templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("/views/index","<!DOCTYPE html><html><head><base href=\"/\"><title>Rocket League Rank - View & Share your Rocket League Rank!</title><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><link rel=\"stylesheet\" href=\"/css/base.css\"><link rel=\"stylesheet\" href=\"/vendor/ng-scrollbar/dist/ng-scrollbar.min.css\"></head><body ng-app=\"app\"><div class=\"wrapper\"><header ng-include=\"\'/views/navbar/navbar\'\"></header><section id=\"main\" ng-view></section></div><footer><div class=\"container\"><div class=\"sp__footer\"><div class=\"row\"><div class=\"col-sm-4\">&copy; Jonnerz 2016</div><div class=\"col-sm-8 text-right\"> This website is not affiliated with <a href=\"psyonix.com\">Psyonix</a>.</div></div></div></div></footer><script src=\"/vendor/angular/angular.js\"></script><script src=\"/vendor/jquery/dist/jquery.js\"></script><script src=\"/vendor/angular-route/angular-route.js\"></script><script src=\"/vendor/bootstrap/dist/js/bootstrap.js\"></script><script src=\"/app/rlrank-templates.js\"></script><script src=\"/app/app.js\"></script><script src=\"/app/home/home.ctrl.js\"></script><script src=\"/app/leaderboard/leaderboard.ctrl.js\"></script><script src=\"/app/profile/profile.ctrl.js\"></script><script src=\"/app/_core/api.svc.js\"></script><script src=\"/app/_core/filters.js\"></script><script src=\"/app/_core/route.svc.js\"></script><script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?\'http\':\'https\';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+\'://platform.twitter.com/widgets.js\';fjs.parentNode.insertBefore(js,fjs);}}(document, \'script\', \'twitter-wjs\');</script></body></html>");
$templateCache.put("/views/home/home","<div class=\"sp__wrapper\"><div class=\"container\"><div class=\"sp__hero\"><h1>View & share your Rocket League rank</h1><div class=\"row\"><div class=\"col-md-4 col-md-offset-4\"><form class=\"sp__rank-form\"><div class=\"form-group\"><label class=\"control-label\">Enter a Steam Profile URL</label><input ng-model=\"vm.steamProfileUrl\" placeholder=\"https://steamcommunity.com/profiles/76561198076736523\" class=\"form-control\"/></div><button ng-click=\"vm.router.goToProfile(vm.steamProfileUrl)\" class=\"btn btn-primary btn-block\">Get Ranks & Stats</button></form></div></div></div><div class=\"sp__leaderboards\"><h2>Global Leaderboards</h2><div class=\"row\"><div ng-repeat=\"(playlist, leaderboard) in vm.leaderboards\" class=\"col-md-3\"><h3>{{ playlist | rlPlaylist }}</h3><table class=\"table table-responsive sp__table\"><tr><td><strong>Pos</strong></td><td><strong>Rank</strong></td><td><strong>Username</strong></td><td><strong>MMR</strong></td></tr><tr ng-repeat=\"player in leaderboard | limitTo:10\"><td><strong>{{ \'#\' + ($index + 1) }}</strong></td><td><img ng-src=\"/img/ranks/{{ player.Value }}_w.png\" ng-title=\"player.Value | rlPlaylist\" class=\"img-responsive\"/></td><td><span ng-if=\"player.UserName\" ng-title=\"player.UserName\">{{ player.UserName }}</span></td><td><span ng-if=\"player.MMR\">{{ player.MMR }}</span></td></tr></table></div></div></div></div></div>");
$templateCache.put("/views/navbar/navbar","<nav class=\"navbar navbar-default\"><div class=\"container\"><div class=\"navbar-header\"><button type=\"button\" data-toggle=\"collapse\" data-target=\"#bs-example-navbar-collapse-1\" aria-expanded=\"false\" class=\"navbar-toggle collapsed\"><span class=\"sr-only\">Toggle navigation</span><span class=\"icon-bar\"></span><span class=\"icon-bar\"></span><span class=\"icon-bar\"></span></button><a href=\"/\" class=\"navbar-brand\">RL Rank</a></div><div id=\"bs-example-navbar-collapse-1\" class=\"collapse navbar-collapse\"><ul class=\"nav navbar-nav navbar-right\"><li><a href=\"/leaderboards\">LEADERBOARDS</a></li><li><a href=\"#\">ABOUT</a></li><li><a href=\"#\">CONTACT</a></li></ul></div></div></nav>");
$templateCache.put("/views/leaderboard/leaderboard","<div class=\"sp__wrapper\"><div class=\"container\"><div class=\"row\"><div class=\"col-md-8\"><h1>Global Leaderboards</h1></div><div class=\"col-md-4\"><div class=\"sp__mini-rank-form\"><form class=\"sp__rank-form\"><div class=\"form-group\"><label class=\"control-label\">Enter a Steam Profile URL</label><input ng-model=\"vm.steamProfileUrl\" placeholder=\"https://steamcommunity.com/profiles/76561198076736523\" class=\"form-control\"/></div><button ng-click=\"vm.router.goToProfile(vm.steamProfileUrl)\" class=\"btn btn-primary btn-block\">Get Ranks & Stats</button></form></div></div></div><div class=\"sp__leaderboards\"><div class=\"row\"><div ng-repeat=\"(playlist, leaderboard) in vm.leaderboards\" class=\"col-md-3\"><h3>{{ playlist | rlPlaylist }}</h3><table class=\"table table-responsive sp__table\"><tr><td><strong>Pos</strong></td><td><strong>Rank</strong></td><td><strong>Username</strong></td><td><strong>MMR</strong></td></tr><tr ng-repeat=\"player in leaderboard\"><td><strong>{{ \'#\' + ($index + 1) }}</strong></td><td><img ng-src=\"/img/ranks/{{ player.Value }}_w.png\" ng-title=\"player.Value | rlPlaylist\" class=\"img-responsive\"/></td><td><span ng-if=\"player.UserName\" ng-title=\"player.UserName\">{{ player.UserName }}</span></td><td><span ng-if=\"player.MMR\">{{ player.MMR }}</span></td></tr></table></div></div></div></div></div>");
$templateCache.put("/views/profile/profile","<div class=\"sp__wrapper\"><div class=\"container\"><div class=\"sp__hero\"><h1>{{ vm.profile.personaname }}</h1><div class=\"row\"><div class=\"col-md-4 col-md-offset-4\"><table class=\"table table-responsive sp__table\"><tr ng-if=\"vm.playlists\"><td><strong>Mode</strong></td><td colspan=\"2\"><strong>Rank</strong></td><td><strong>Matches Played</strong></td><td><strong>MMR</strong></td></tr><tr ng-repeat=\"playlist in vm.playlists\" ng-if=\"playlist.Playlist\"><td> <span>{{ playlist.Playlist | rlPlaylist }}</span></td><td> <img ng-src=\"/img/ranks/{{ playlist.Tier || 0 }}_w.png\" title=\"{{ playlist.Tier | rlTier }}\" style=\"width:36px;\"/></td><td class=\"text-left\"> <span>{{ playlist.Tier | rlTier }}</span></td><td><span ng-if=\"playlist.MatchesPlayed\">{{ playlist.MatchesPlayed }} </span></td><td><span ng-if=\"playlist.MMR\">{{ playlist.MMR }}</span></td></tr></table><div ng-if=\"vm.playlists\" class=\"sp__share\"><h4>Share</h4><div class=\"row\"><div class=\"col-md-8\"><div ng-if=\"vm.playlists\" class=\"form-group\"><input ng-model=\"vm.shareUrl\" readonly=\"readonly\" class=\"form-control input-sm\"/></div></div><div class=\"col-md-4\"></div><a ng-href=\"https://twitter.com/intent/tweet?text=Check out my Rocket League rank!&amp;url={{ vm.shareUrl }}&amp;via=rlrank&amp;hashtags=rlrank,rocketleague\" target=\"_blank\" class=\"twitter-share-button\">Tweet</a><a target=\"_blank\" ng-href=\"http://www.facebook.com/sharer/sharer.php?u={{ vm.shareUrl }}\">Facebook</a></div></div><hr ng-if=\"vm.playlists\"/><form class=\"sp__rank-form\"><div class=\"form-group\"><label class=\"control-label\">Enter a Steam Profile URL</label><input ng-model=\"vm.steamProfileUrl\" placeholder=\"https://steamcommunity.com/profiles/76561198076736523\" class=\"form-control\"/></div><button ng-click=\"vm.router.goToProfile(url)\" class=\"btn btn-primary btn-block\">Get Ranks & Stats</button></form></div></div></div></div></div>");}]);