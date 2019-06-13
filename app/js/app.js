"use strict";

// Declare app level module which depends on filters, and services
var myApp = angular.module("hkAccessibleApp", [
  "hkAccessibleServices",
  "hkAccessibleFilters",
  "hkDirectives",
  "hkAccessibleControllers",
  "linkController",
  "accessibleController",
  "mapController",
  "hkRouter",
  "pascalprecht.translate",
  "ui.map",
  "ui.event",
  "ui.bootstrap",
  "isteven-multi-select",
  "dialogs.main",
  "dialogs.controllers"
]);

myApp
  .config([
    "$translateProvider",
    "$localStorageProvider",
    function($translateProvider, $localStorageProvider) {
      $translateProvider.useSanitizeValueStrategy("escape");
      $translateProvider.useStaticFilesLoader({
        prefix: "/app/lang/",
        suffix: ".json"
      });
      $translateProvider.preferredLanguage("zh_hk");
      $translateProvider.fallbackLanguage("zh_hk");
      $translateProvider.useMissingTranslationHandlerLog();

      $localStorageProvider.set("loadFirstTimeLang", false);
    }
  ])
  .constant("_", window._)
  // use in views, ng-repeat="x in _.range(3)"
  .run(function($rootScope) {
    $rootScope._ = window._;
  });
