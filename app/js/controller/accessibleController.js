'use strict';

/* Controllers */

var moduleCtrl = angular.module('accessibleController', []);

// attraction controller
// use filterFilter, https://docs.angularjs.org/guide/filter
// example
moduleCtrl.controller('AccessibleCtrl', ['$scope', 'Accessible', 'MatchCriteria',
    '$location', '$anchorScroll', '$timeout', 'locationResult',
    '$localStorage', 'translateHeader',
   function($scope, Accessible, MatchCriteria, $location, $anchorScroll,
     $timeout, locationResult, $localStorage, translateHeader) {

    var vm = this;
    this.totalNumber = 0;
    this.currentPage = 1;
    this.maxSize = 8;
    this.itemsPerPage = 15;
    this.query = {
      name_en : "",
      address_en : "",
      phone_number : ""
    };

    // category - selected hashset
    this.filter_category = {};
    this.selected_access = {};
    this.access_obj = [];
    this.service_area = [];

    this.category = {
        original : [],
        current : []
    };

    this.categoryName = translateHeader;

    $scope.$on('TRANSLATE_ACCESSIBILITY_DESC',
      angular.bind(this,
        function(event, langKey) {
          var ref = this;
          Accessible.translateAccessDesc(this.service_area,
              this.access_obj, langKey)
          .then(function(data) {
            ref.access_obj =  data;
          });
        })
    );

    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        $timeout(function() {
            $location.hash('top_page');
            $anchorScroll();
        }, 300);
    });

    this.locations = locationResult.data;
    this.filtered = locationResult.data;
    this.totalNumber = this.filtered.length;
    this.filter_category = _.reduce(locationResult.category.current, function(o, c) {
        o[c.name] = true;
        return o;
    }, {});

    this.service_area = locationResult.service_area;
    this.access_obj = locationResult.access_obj;
    this.category.original = locationResult.category.original;
    this.category.current = locationResult.category.current;

    this.$storage = $localStorage;
    if (!this.$storage.loadFirstTimeLang) {
      $scope.$broadcast('TRANSLATE_ACCESSIBILITY_DESC', 'zh_hk');
      this.$storage.loadFirstTimeLang = true;
    }

    this.showImage = false;
    // http://stackoverflow.com/questions/19251226/load-from-http-get-on-accordion-group-open-using-angularjs
    // this.loadExploreImage = function loadImg(location) {

    //   // var geoAddress = {
    //   //   address_en : location.address_en + ', Hong Kong',
    //   //   address_zh_hk : location["address-zh-hk"],
    //   //   name_en : location.name_en,
    //   //   name_zh_hk : location.name_zh_hk
    //   // };

    //   // PlaceExplorer.getImageUrl(location, geoAddress)
    //   //   .then(function(data) {
    //   //       data.loc.geo.lat = data.lat;
    //   //       data.loc.geo.lng = data.lng;
    //   //       data.loc.exploreImage = data.url;
    //   //       vm.showImage = true;
    //   //     },
    //   //    function(data) {
    //   //       data.loc.geo.lat = data.lat;
    //   //       data.loc.geo.lng = data.lng;
    //   //       data.loc.exploreImage = data.url;
    //   //       vm.showImage = false;
    //   //   });
    // };

    this.scrollToElement = function scrollTo(id) {
        $location.hash(id);
        $anchorScroll();
    };

    this.searchData = function search() {
        this.filtered = MatchCriteria.match(this.locations, this.query);
        this.filtered = MatchCriteria.filterCategory(this.filtered, this.filter_category);
        this.filtered = MatchCriteria.filterAccessibility(this.filtered, this.service_area,
                             this.selected_access);
        this.totalNumber = this.filtered.length;
        this.currentPage = 1;
        this.category.current = MatchCriteria.countCategoryElement(this.filtered,
                                    this.category.original);
     }

    $scope.$watchGroup (['vm.query.name_en', 'vm.query.address_en', 'vm.query.phone_number'],
      function(newValues, oldValues, scope) {
        vm.query.name_en = newValues[0];
        vm.query.address_en = newValues[1];
        vm.query.phone_number = newValues[2];
        vm.searchData();
      }
    );

   $scope.$watchCollection('vm.filter_category', function(checkValue) {
      // category names have not added to hash set yet
      if (Object.getOwnPropertyNames(checkValue).length === 0) {
        return;
      }
      vm.searchData();
   });

  $scope.$watch(function() {
      return vm.selected_access;
    },
    function(checkValue) {
       if (Object.getOwnPropertyNames(checkValue).length === 0) {
          return;
       }
       vm.searchData();
    }, true);
}]);
