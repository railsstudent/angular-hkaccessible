'use strict';

/* Controllers */

var moduleCtrl = angular.module('accessibleController', []);

// attraction controller
// use filterFilter, https://docs.angularjs.org/guide/filter
// example
moduleCtrl.controller('AccessibleCtrl', ['$scope', 'Accessible', 'MatchCriteria',
    'PlaceExplorer', '$location', '$anchorScroll', '$timeout', 'locationResult',
    '$localStorage',
   function($scope, Accessible, MatchCriteria, PlaceExplorer, $location, $anchorScroll,
     $timeout, locationResult, $localStorage) {

    $scope.totalNumber = 0;
    $scope.currentPage = 1;
    $scope.maxSize = 8;
    $scope.itemsPerPage = 15;
    $scope.query = {
      name_en : "",
      address_en : "",
      phone_number : ""
    };

    // category - selected hashset
    $scope.filter_category = {};
    $scope.selected_access = {};
    $scope.access_obj = [];
    $scope.service_area = [];

    $scope.category = {
        original : [],
        current : []
    };

    $scope.$on('TRANSLATE_ACCESSIBILITY_DESC', function(event, langKey) {
        Accessible.translateAccessDesc($scope.service_area,
            $scope.access_obj, langKey)
        .then(function(data) {
          $scope.access_obj =  data;
        });
    });

    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
      console.log('stateChangeSuccess');

        $timeout(function() {
            $location.hash('top_page');
            $anchorScroll();
        }, 300);
    });

    $scope.locations = locationResult.data;
    $scope.filtered = locationResult.data;
    $scope.totalNumber = $scope.filtered.length;
    $scope.filter_category = _.reduce(locationResult.category.current, function(o, c) {
        o[c.name] = true;
        return o;
    }, {});

    $scope.service_area = locationResult.service_area;
    $scope.access_obj = locationResult.access_obj;
    $scope.category.original = locationResult.category.original;
    $scope.category.current = locationResult.category.current;

    $scope.$storage = $localStorage;
    if (!$scope.$storage.loadFirstTimeLang) {
      $scope.$broadcast('TRANSLATE_ACCESSIBILITY_DESC', 'zh_hk');
      $scope.$storage.loadFirstTimeLang = true;
    }

    $scope.showImage = false;
    // http://stackoverflow.com/questions/19251226/load-from-http-get-on-accordion-group-open-using-angularjs
    $scope.loadExploreImage = function loadImg(location) {

      var geoAddress = {
        address_en : location.address_en + ', Hong Kong',
        address_zh_hk : location["address-zh-hk"],
        name_en : location.name_en,
        name_zh_hk : location.name_zh_hk
      };

      PlaceExplorer.getImageUrl(location, geoAddress)
        .then(function(data) {
            data.loc.geo.lat = data.lat;
            data.loc.geo.lng = data.lng;
            data.loc.exploreImage = data.url;
            $scope.showImage = true;
          },
         function(data) {
            data.loc.geo.lat = data.lat;
            data.loc.geo.lng = data.lng;
            data.loc.exploreImage = data.url;
            $scope.showImage = false;
        });
    };

    $scope.scrollToElement = function scrollTo(id) {
        $location.hash(id);
        $anchorScroll();
    };

    var searchData = function search() {
        $scope.filtered = MatchCriteria.match($scope.locations, $scope.query);
        $scope.filtered = MatchCriteria.filterCategory($scope.filtered, $scope.filter_category);
        $scope.filtered = MatchCriteria.filterAccessibility($scope.filtered, $scope.service_area,
                             $scope.selected_access);
        $scope.totalNumber = $scope.filtered.length;
        $scope.currentPage = 1;
        $scope.category.current = MatchCriteria.countCategoryElement($scope.filtered,
                                    $scope.category.original);
     }

    $scope.$watchGroup (['query.name_en', 'query.address_en', 'query.phone_number'],
      function(newValues, oldValues, scope) {
        $scope.query.name_en = newValues[0];
        $scope.query.address_en = newValues[1];
        $scope.query.phone_number = newValues[2];
        searchData();
    });

   $scope.$watchCollection('filter_category', function(checkValue) {
       // category names have not added to hash set yet
      if (Object.getOwnPropertyNames(checkValue).length === 0) {
        return;
      }
      searchData();
    });

  $scope.$watch('selected_access', function(checkValue) {
       if (Object.getOwnPropertyNames(checkValue).length === 0) {
          return;
       }
       searchData();
    }, true);
  }]);
