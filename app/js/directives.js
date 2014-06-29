'use strict';

/* Directives */


var app = angular.module('myApp.directives', []);

app.
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }])
  .directive('appAuthor', ['author', function(author) {
    return function(scope, elm, attrs){
        elm.text(author);
    };
  }]);
