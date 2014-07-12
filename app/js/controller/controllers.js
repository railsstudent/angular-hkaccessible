'use strict';

/* Controllers */

var moduleCtrl = angular.module('hkAccessibleControllers', []);

moduleCtrl.controller("HomeCtrl", ["$scope", "$location", '$translate', '$rootScope', 
  function($scope, $location, $translate, $rootScope) {
    $scope.isActive = function (viewLocation) { 
        return viewLocation === $location.path();
    };

    $scope.changeLanguage = function (langKey) {
      $translate.use(langKey);
      // broadcast event to translation  the description in multiselect accessibility dropdown
      $rootScope.$broadcast('TRANSLATE_ACCESSIBILITY_DESC');
    };

  }]);

