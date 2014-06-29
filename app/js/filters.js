'use strict';

/* Filters */

angular.module('hkAccessibleFilters', []).
  filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    };
  }])

.filter('offset', function() {
  return function(input, start) {
    start = parseInt(start, 0);
    return input.slice(start);
  };
});
