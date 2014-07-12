var mapModuleCtrl = angular.module('mapController', []);

mapModuleCtrl
	.controller('MapCtrl', ['$rootScope', '$scope', 'GetAddress', 'GeocoderCache','dialogs', '$translate',
      function($rootScope, $scope, GetAddress, 
          GeocoderCache, dialogs, $translate) {

      // http://codepen.io/m-e-conroy/pen/ALsdF
      // angular-dialog-service

      $scope.model = { myMap : undefined };
      $scope.mapOptions = {
          zoom: 10,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          center: new google.maps.LatLng(22.426724, 114.210775),
          disableDefaultUI: true
      };

      // http://codepen.io/m-e-conroy/pen/ALsdF
      // show progress dialog and close when all the markers are rendered.
      $scope.currentInfoWindow = undefined;
      $scope.totalMarkers = 0;
      $scope.myMarkers = [];  

      var createInfoWin = function createInfoWindow(result) {
        
        var myWin = new google.maps.InfoWindow({
            content: '<div>' 
                  +   '<div>' + "Name: " + result.name_en + "</div>"
                  +   '<div>' + "名稱："+ result.name_zh_hk + "</div>"
                  +   '<div>' + "Address: " + result.address + "</div>"
                  +   '<div>' + "地址：" + result.address_zh_hk + "</div>"
                  + '</div>'
          });
        return myWin;
      };

      var createMapMarkers = function createMarkers(addressArray) {
         if (addressArray) {
            $scope.totalMarkers = addressArray.length;
            var bounds = new google.maps.LatLngBounds();
            if (addressArray.length <= 0) {
              $rootScope.$broadcast('dialogs.wait.complete');
              return;  
            }

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
                    marker.info = createInfoWin(result);
                    google.maps.event.addListener(marker, 'click', function() {
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
          } else {
             $rootScope.$broadcast('dialogs.wait.complete');
          }
      };

      var closeProgressDialog = function closeProgDialog(data) {
        $rootScope.$broadcast('dialogs.wait.complete');     
      };

      // http://stackoverflow.com/questions/12410062/check-if-infowindow-is-opened-google-maps-v3
      var isInfoWindowOpen = function isWinOpen(infoWindow) {
        if (infoWindow) {
            var map = infoWindow.getMap();
            // return (map !== null && typeof map !== "undefined");
            return _.isEqual(_.isNull(map), false) &&  _.isEqual(_.isUndefined(map), false); 
        }
        return false;
      };

      //http://stackoverflow.com/questions/1544739/google-maps-api-v3-how-to-remove-all-markers
      var clearOverlays = function _clearOverlays() {
        _.each($scope.myMarkers, function(m) {
          m.setMap(null);
        });
        $scope.totalMarkers = 0;
        $scope.myMarkers = [];  
      }

      $scope.dropdown = {
        myChoice : undefined,
        data : [ 
          { key : "attraction",  tranlsation_key : "ATTRACTION"}, 
          { key : "shopping",  tranlsation_key : "SHOPPING"}, 
          { key : "hotel",  tranlsation_key : "HOTEL"}, 
          { key : "other",  tranlsation_key : "OTHERVENUE"}, 
        ],
        loadMarkers : function(myChoice) {

          if (isInfoWindowOpen($scope.currentInfoWindow)) {
            $scope.currentInfoWindow.close();
          }
          $scope.currentInfoWindow = undefined;

          clearOverlays();

          var dlg = dialogs.wait(undefined, undefined, 0, 
                { backdrop: true, 
                  keyboard: true,
                  size: "sm"
                });

          GetAddress.getAddressNamesByKey(myChoice.key)
            .then(createMapMarkers, closeProgressDialog);
        }
      };
   }]);
