

var moduleCtrl = angular.module('linkController', []);

moduleCtrl.controller ('LinkCtrl', [ '$scope', '$timeout', function($scope, $timeout) {

	this.links = [
	   {
	   		url : 'http://www.gov.hk/en/theme/psi/datasets/accessguide.htm',
	     	desc : 'Hong Kong Data.One Datasets - Accessible facilities in Hong Kong'
	   },

	   {
	   		url : 'http://accessguide.hk/?lang=en&variant',
	     	desc : "A Visitors' Guide to Accessible Facilities in Hong Kong website"
	   },

	   {
	   	 	url : 'http://glyphicons.com/',
	     	desc : "Glyphicons"
	   }

	];

	 $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        $timeout(function() {
            $location.hash('top_page');
            $anchorScroll();
        }, 300);
      });

}]);
