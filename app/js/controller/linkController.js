

var moduleCtrl = angular.module('linkController', []);

moduleCtrl.controller ('LinkCtrl', [ '$scope', '$timeout', function($scope, $timeout) {

	$scope.links = [ 
	   { url : 'http://www.gov.hk/en/theme/psi/datasets/accessguide.htm', 
	     desc : 'Hong Kong Data.One Datasets - Accessible facilities in Hong Kong' 
	   }, 

	   { url : 'http://accessguide.hk/?lang=en&variant',
	     desc : "A Visitors' Guide to Accessible Facilities in Hong Kong website"
	   }

	];

	 $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        console.log('stateChangeSuccess');

        $timeout(function() {
            $location.hash('top_page');
            $anchorScroll();
        }, 300);
      });

}]);

