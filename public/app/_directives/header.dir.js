angular
    .module('app')
    .directive('spHeader', ['$sce', spHeader]);

function spHeader()
{
  var directive = {
    restrict: 'E',
    templateUrl: '/views/navbar/header',
    scope: {
      pageTitle: '@',
      subTitle: '@'
    }
  };

  return directive;
}
