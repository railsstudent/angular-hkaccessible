'use strict';

/* Controllers */

var moduleCtrl = angular.module('otherVenueController', []);

// other venue controller
moduleCtrl
  .controller('VenueCtrl', ['$scope', 'Accessible', 'MatchCriteria',  'PlaceExplorer', 
   function($scope, Accessible, MatchCriteria, PlaceExplorer) {

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
      //$scope.categories = [];
      $scope.selected_access = {};
      $scope.access_obj = [];
      $scope.service_area = [];

      $scope.category = {
        original : [],
        current : []
      };

      $scope.$on('TRANSLATE_ACCESSIBILITY_DESC', function() {
          $scope.access_obj = Accessible.translateAccessDesc($scope.service_area, 
                                  $scope.access_obj);
      });

      Accessible.get("facilities/other_venues.json",'other-venues').
        then(function(locationResult) {
          //$scope.categories = locationResult.categories;
          $scope.locations = locationResult.data;
          $scope.filtered = locationResult.data;
          $scope.totalNumber = $scope.filtered.length;
          $scope.filter_category = _.object(
            _.map(locationResult.category.current, function(c) {
              return [c.name, true];
            })
          );

          $scope.service_area = locationResult.service_area;        
          $scope.access_obj = locationResult.access_obj;
          $scope.category.original = locationResult.category.original;
          $scope.category.current = locationResult.category.current;
        }, function(err) {
          //$scope.categories = [];
          $scope.locations = [];
          $scope.filtered  = [];
          $scope.access_obj = [];
          $scope.service_area = [];
          $scope.totalNumber = $scope.filtered.length;
          $scope.category.original = []; 
          $scope.category.current = [];
        });

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

     // watch changes in filter fields
      $scope.$watch('query.name_en', function(term) {
         $scope.query.name_en = term.trim();
          searchData();
      });

     $scope.$watch('query.address_en', function(term) {
       $scope.query.address_en = term.trim();
       searchData();
    });

     $scope.$watch('query.phone_number', function(term) {
       $scope.query.phone_number = term.trim();
       searchData();
    });

    $scope.$watch('filter_category', function(checkValue) {
       // category names have not added to hash set yet
       if (Object.getOwnPropertyNames(checkValue).length === 0) {
        return;
       }
       searchData();
    }, true);

    $scope.$watch('selected_access', function(checkValue) {
       if (Object.getOwnPropertyNames(checkValue).length === 0) {
          return;
       }
       searchData();
    }, true);

  }]);