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

// attraction controller
// use filterFilter, https://docs.angularjs.org/guide/filter
// example
moduleCtrl.controller('AttractionCtrl', ['$scope', 'Accessible', 'MatchCriteria', 
  '$modal', 'PlaceExplorer', 
   function($scope, Accessible, MatchCriteria, $modal, PlaceExplorer) {
  	
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

    $scope.$on('TRANSLATE_ACCESSIBILITY_DESC', function() {
        $scope.access_obj = Accessible.translateAccessDesc($scope.service_area, 
            $scope.access_obj);
    });

    Accessible.get("facilities/attractions.json","attractions").
      then(function(locationResult) {
        $scope.locations = locationResult.data;
        $scope.filtered = locationResult.data;
        $scope.totalNumber = $scope.filtered.length;
        //http://stackoverflow.com/questions/17802140/underscore-js-map-array-of-key-value-pairs-to-an-object-one-liner
        $scope.filter_category = _.object(
          _.map(locationResult.category.current, function(c) {
            return [c.name , true];
          })
        );

        $scope.service_area = locationResult.service_area;        
        $scope.access_obj = locationResult.access_obj;
        $scope.category.original = locationResult.category.original;
        $scope.category.current = locationResult.category.current;
      }, function(errResult) {
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
  }])

  // shopping and dining controller 
  .controller('ShopDineCtrl', ['$scope', 'Accessible', 'MatchCriteria',
     'PlaceExplorer', 
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

      Accessible.get("facilities/shoppings.json","shopping-dining").
        then(function(locationResult) {
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

  }])

  // hotel controller
  .controller('HotelCtrl', ['$scope',  'Accessible', 'MatchCriteria',  'PlaceExplorer', 
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

      Accessible.get("facilities/hotels.json","hotels").
        then(function(locationResult) {
          $scope.locations = locationResult.data;
          $scope.filtered = locationResult.data;
          $scope.totalNumber = $scope.filtered.length;
          $scope.filter_category = _.object(
            _.map(locationResult.category.current, function(c) {
              return [c.name , true];
            })
          );

          $scope.service_area = locationResult.service_area;    
          $scope.access_obj = locationResult.access_obj;   
          $scope.category.original = locationResult.category.original;
          $scope.category.current = locationResult.category.current; 
        }, function(err) {
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

  }])

  // other venue controller
  .controller('VenueCtrl', ['$scope', 'Accessible', 'MatchCriteria',  'PlaceExplorer', 
   function($scope, Accessible, MatchCriteri, PlaceExplorer) {

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

  }])
  .controller('MapCtrl', ['$rootScope', '$scope', 'GetAddress', 'GeocoderCache','dialogs', '$translate',
      function($rootScope, $scope, GetAddress, GeocoderCache, dialogs, $translate) {

      // http://codepen.io/m-e-conroy/pen/ALsdF
      // angular-dialog-service

      $scope.model = { myMap : undefined };
      $scope.mapOptions = {
          center :  new google.maps.LatLng(-34.397, 150.644),
          zoom: 8,
          mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      // http://codepen.io/m-e-conroy/pen/ALsdF
      // show progress dialog and close when all the markers are rendered.

      $scope.currentInfoWindow = undefined;

      //Markers should be added after map is loaded
      $scope.onMapIdle = function() {
          if ($scope.myMarkers === undefined) { 

            var dlg = dialogs.wait(undefined, undefined, 0, 
                { backdrop: true, 
                  keyboard: true,
                  size: "sm"
                });

            $scope.totalMarkers = 0;
            $scope.myMarkers = [];  
            GetAddress.getAddressNames()
              .then(function(addressArray) {
                  if (addressArray) {
                    $scope.totalMarkers = addressArray.length;
                    var bounds = new google.maps.LatLngBounds();
                    _.each(addressArray, function(address) {                      
                      GeocoderCache.geocodeAddress(address)
                        .then(function(result) {
                          var latlng = new google.maps.LatLng(result.lat, result.lng);
                          var marker = new google.maps.Marker({
                              map: $scope.model.myMap,
                              position: latlng,
                              title : result.formattedAddress
                            });

                          // attach an info window to each marker.
                          // attach click event to marker to open info window
                          // http://stackoverflow.com/questions/3158598/google-maps-api-v3-adding-an-infowindow-to-each-marker
                          marker.info = new google.maps.InfoWindow({
                            content: '<div>' 
                                    +   '<div>' + "Name: " + result.name_en + "</div>"
                                    +   '<div>' + "名稱："+ result.name_zh_hk + "</div>"
                                    +   '<div>' + "Address: " + result.address + "</div>"
                                    +   '<div>' + "地址：" + result.address_zh_hk + "</div>"
                                    + '</div>'
                          });

                          google.maps.event.addListener(marker, 'click', function() {
                            //marker.info.height(marker.info.height());
                            if ($scope.currentInfoWindow) {
                              $scope.currentInfoWindow.close();
                            }
                            $scope.currentInfoWindow = marker.info;
                            $scope.currentInfoWindow.open($scope.model.myMap, marker);
                          });

                          $scope.myMarkers.push(marker);
                          bounds.extend(latlng);
                          $scope.model.myMap.fitBounds(bounds);

                          // update progress bar in dialog
                          var progress =  ($scope.myMarkers.length / addressArray.length) * 100.0;
                          if (progress < 100) {
                            $rootScope.$broadcast('dialogs.wait.progress',
                               { progress: progress,
                                 msg : progress.toFixed(2) + $translate.instant("DIALOGS_PERCENT_COMPLETE")
                               });
                          } else {
                              $rootScope.$broadcast('dialogs.wait.complete');
                          }
                      });
                    });
                  }
              });
          }
      };
   }]);
