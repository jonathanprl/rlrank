angular
    .module('app')
    .directive('rankForm', rankForm);

function rankForm()
{
  var directive = {
    restrict: 'E',
    templateUrl: '/views/widgets/rankForm',
    scope: true,
    link: linkFunc,
    controller: RankFormController,
    controllerAs: 'vm',
    bindToController: true // because the scope is isolated
  };

  return directive;

  function linkFunc(scope, el, attr, ctrl) {

  }
}

RankFormController.$inject = ['ApiSvc', 'Analytics', '$location'];

function RankFormController(ApiSvc, Analytics, $location)
{
  var vm = this;

  vm.goToProfile = goToProfile;
  vm.setPlatform = setPlatform;

  vm.placeholder = {
    'steam': 'Enter a Steam profile URL, ID or name',
    'psn': 'Enter a PSN username',
    'xbox': 'Enter a Xbox Live gamertag'
  };
  vm.platform = {id: 'steam', name: 'Steam'};


  function setPlatform(platform)
  {
    if (platform == 'psn')
    {
      vm.platform = {id: 'psn', name: 'Playstation'};
    }
    else
    {
      vm.platform = {id: platform, name: platform.charAt(0).toUpperCase() + platform.slice(1)};
    }
  }

  function goToProfile()
  {
    vm.showLoader = true;
    ApiSvc.authorise(vm.input, vm.platform.id)
      .then(
        function(response)
        {
          Analytics.trackEvent('profile', 'find', vm.input + '@' + vm.platform.id);
          $location.path('u/' + response.data.profile.rlrank_id);
        })
      .catch(
        function(err)
        {
          vm.profileError = err.data.message;
          vm.showLoader = false;
        }
      );
  }
}
