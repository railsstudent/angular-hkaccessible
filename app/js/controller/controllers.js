'use strict';

/* Controllers */

var moduleCtrl = angular.module('hkAccessibleControllers', []);

moduleCtrl.controller("HomeCtrl", ["$location", '$translate', '$rootScope',
  function($location, $translate, $rootScope) {
    this.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };

    this.changeLanguage = function (langKey) {
      $translate.use(langKey);
      // broadcast event to translation  the description in multiselect accessibility dropdown
      $rootScope.$broadcast('TRANSLATE_ACCESSIBILITY_DESC', langKey);
      $rootScope.$broadcast('TRANSLATE_HEADER', langKey);
    };

  }]);
