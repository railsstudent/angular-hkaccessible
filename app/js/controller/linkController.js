

var moduleCtrl = angular.module('linkController', []);

moduleCtrl.controller ('MiscCtrl', [ '$scope', function($scope) {

	$scope.links = [ 
	   { url : 'http://www.gov.hk/en/theme/psi/datasets/accessguide.htm', 
	     desc : 'Hong Kong Data.One Datasets - Accessible facilities in Hong Kong' 
	   }, 

	   { url : 'http://accessguide.hk/?lang=en&variant',
	     desc : "A Visitors' Guide to Accessible Facilities in Hong Kong website"
	   }

	];

}]);

