'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
var accessibleServices = angular.module('hkAccessibleServices', ['ngStorage']);

accessibleServices
  .value('version', '0.5.0')
  .value('author','Connie Leung');

accessibleServices.factory('Accessible', ['$http', '$q', '$translate',
	function($http, $q, $translate) {
		var prependHttp = function(strUrl) {
			if (strUrl != null && strUrl.indexOf("http://") == -1) {
			    strUrl = "http://" + strUrl;
			}
			if (strUrl != null && strUrl.indexOf("http://") != 0) {
			    var idx = strUrl.indexOf("http://");
			    strUrl = strUrl.substring(idx);
			}
			return strUrl;
		}

		var processAccessCode = function(origCodeArray) {

			// if code is P2, break it into P1 + W1
			var arr = _.map(origCodeArray, function(code) {
				var baseUrl = "http://accessguide.hk/images/";
				var codeValue = code['#text'];
				if (_.isEqual(codeValue, "P2")) {
					return [ { imgCode : "P1", descCode: "P2", imgUrl : baseUrl + 'P1.jpg' },
					         { imgCode : "W2", descCode: "P2", imgUrl : baseUrl + 'W2.jpg' } ];
				} else {
					return [ { imgCode : codeValue, descCode: codeValue,
						imgUrl : baseUrl + codeValue + '.jpg' } ];
				}
			});
			return _.flatten(arr);
		}

		var baseUrl = "http://accessguide.hk/images/";
		var arrAccessObj = [
			{ logo: "<img src='" + baseUrl + "W0.jpg' class='multiSelect' />",  imgCode: "W0",
				desc : "(Facilities inaccessible to wheelchair users)", ticked: false },
			{ logo: "<img src='" + baseUrl + "W1.jpg' class='multiSelect' />",  imgCode: "W1",
				desc : "(Facilities accessible to wheelchair users but not up to local design standard)",
				ticked: false },
			{ logo: "<img src='" + baseUrl + "W2.jpg' class='multiSelect' />",  imgCode: "W2",
				desc : "(Facilities accessible to wheelchair users and meeting local design standard)",
				ticked: false },
			{ logo: "<img src='" + baseUrl + "H.jpg' class='multiSelect' />",  imgCode: "H",
				desc : "(Facilities available for hearing impaired persons)",
				ticked: false },
			{ logo: "<img src='" + baseUrl + "V.jpg' class='multiSelect' />",  imgCode: "V",
				desc : "(Facilities available for visually impaired persons)",
				ticked: false },
			{ logo: "<img src='" + baseUrl + "P1.jpg' class='multiSelect' />",  imgCode: "P1",
				desc : "(Parking facilities available)",
				ticked: false },
			//{ logo: "<img src='" + baseUrl + "P1.jpg' class='multiSelect' />",  imgCode: "P2",
			//	desc : "(Car park with reserved parking space for disabled drivers)",
			//	ticked: false },
			{ logo: "<img src='" + baseUrl + "L.jpg' class='multiSelect' />",  imgCode: "L",
				desc : "(Locked)", ticked: false }
		];

		return {
			get : function(callUrl, rootElement) {

				var deferredData = $q.defer();
				var arrLocation = [];
				var arrCategories = [];
				var arrServiceArea = [];
				var nestedAccessObj = [];
				var orig_cat = [];

				var locationResult = {
					data : [],
					access_obj : [],
					service_area : [],
					category : {
						original : [],
						current : []
					}
				};

				$http({
			      method: "GET",
			      url: callUrl
			    }).success(function(data) {
			     	if (rootElement) {
		     			arrLocation = data[rootElement].locations;
		     			angular.forEach(arrLocation, function(loc, index) {
					        loc.name_en = loc["name-en"];
					        loc.address_en = loc["address-en"];
					        loc.phone_number = loc["phone-number"];
				       		loc.url_en = prependHttp(loc["url-en"]);
				       		loc.url_hk = prependHttp(loc["url-zh-hk"]);
							loc.name_en  = loc.name_en.replace("’", "'");
							loc.name_zh_hk = loc["name-zh-hk"];

							if (loc.catergory === "art-performance-centres"
								|| loc.catergory == "art-performance-center")  {
								loc.catergory = "arts-and-performance-centres";
							} else if (loc.catergory === "computer-centres") {
								loc.catergory = "computer-centre";
							} else if (loc.catergory === "church") {
								loc.catergory = "church1";
							}

				     		loc.exploreImage = '';
				     		loc.geo = { lat : 0, lng : 0 };

                var isCategoryExists = _.includes(_.map(arrCategories,
                        function(a) { return a.name; }), loc.catergory);

  							if (isCategoryExists === false) {
  								arrCategories.push({ name: loc.catergory, count: 1 });
  								orig_cat.push({ name: loc.catergory, count: 1 });
  							} else {
  								var cat = _.find(arrCategories,
  									             function(c) { return _.isEqual(c.name, loc.catergory); });
  							  cat.count = cat.count + 1;
  							}

  							_.each(loc.accessible, function(value, key) {
					          var arrAccessCode = value;
					          if (_.isEqual(_.isArray(value), false)) {
					            arrAccessCode =  [value];
					          }
					          loc.accessible[key] =  processAccessCode(arrAccessCode);
					        });
							arrServiceArea = _.union(arrServiceArea, _.keys(loc.accessible));
				        }); // end angular.forEach (arrLocation)

						arrServiceArea = arrServiceArea.sort();
				        _.each (arrServiceArea, function(s_area) {
				            nestedAccessObj[s_area] = [];
						    _.each (arrAccessObj, function(obj) {
						    	var cloneObj = _.extend({}, obj);
						    	nestedAccessObj[s_area].push(cloneObj);
					        });
			     		});
			     	}

					locationResult = {
						data : arrLocation,
						access_obj : nestedAccessObj,
						service_area : arrServiceArea,
						category : {
							original : orig_cat,
							current  : arrCategories
						}
					};
		     		deferredData.resolve(locationResult);

				}).error(function(data) {
			     	deferredData.reject(locationResult);
				});
				return deferredData.promise;
			},	// end of get
			translateAccessDesc : function (service_area_array, nested_access_obj, langKey) {
         var deferred = $q.defer();
          $translate.use(langKey)
          .then(function() {
              _.each (service_area_array, function(service_area) {
  		          	_.each (nested_access_obj[service_area], function(d1) {
  		            	 d1.desc = '(' + $translate.instant(d1.imgCode) + ')';
  		          	});
  		        });
	            deferred.resolve(nested_access_obj);
          });
          return deferred.promise;
			}
		};
	}])
	.factory("MatchCriteria", [ "filterFilter", function(filterFilter) {

		return {
			match : function(locationData, query) {
				var criteria = {};
		        if (_.isUndefined(query.name_en)) {
		        } else {
		        	if (query.name_en != "") {
		            	criteria.name_en = query.name_en;
		        	}
		        }

		        if (_.isUndefined(query.address_en)) {
		        } else {
			        if (query.address_en != "") {
			            criteria.address_en = query.address_en;
			        }
		    	}

		        if (_.isUndefined(query.phone_number)) {
		        } else {
			        if (query.phone_number != "") {
			            criteria.phone_number = query.phone_number;
			        }
		    	}
		    	return filterFilter(locationData, criteria);
			},
			filterCategory : function(locationData, filter_category) {
				var result = [];
				if (_.isUndefined(locationData)) {
					return result;
				}

				result = _.filter (locationData, function(data, index) {
					return  _.isEqual(filter_category[data.catergory], true);
				});

				return result;
			},
			filterAccessibility : function(locationData, arr_service_area, selected_access) {
				if (_.isUndefined(locationData)) {
					return [];
				}

				var result = _.filter(locationData, function(data) {
					var accessible_data = data.accessible;
					var isMatched = _.every(arr_service_area, function(service_area) {
						if (_.isEqual(_.has(selected_access, service_area), true)) {
							var arr_selected = _.map(selected_access[service_area], function(a) { return a.imgCode; });
							if (arr_selected.length > 0) {
								if (_.isEqual(_.has(accessible_data, service_area), true)) {
									var arr_accessible = _.map(accessible_data[service_area],
                          function(a) { return a.imgCode; });
									return _.isEqual(_.isEmpty(_.intersection(arr_accessible, arr_selected)), false);
								} else {
									return false;
								}
							}
						}
						return true;
					});
					return isMatched;
				});
				return result;
			},
			countCategoryElement : function(locationData, orig_category) {

				var arrCategoryCount = _.map(orig_category, function(o) {
					return {name : o.name, count : 0};
				});

 				_.each(locationData, function(data) {
 					if (_.isEqual(_.includes(arrCategoryCount, data.catergory), true)) {
 						arrCategoryName.push({name: data.category, count : 1});
 					} else {
 						var cat = _.find(arrCategoryCount, function(c) {
 							return c.name === data.catergory;
 						});
 						cat.count = cat.count + 1;
 					}
 				});
				return arrCategoryCount;
			}
		};
	}])
.factory('GetAddress', ['$q', '$http', function($q, $http) {
	return {

		getAddressNamesByKey : function(key) {

			var name = "facilities/attractions.json";
			if (_.isEqual(key, "attraction")) {
				name = "facilities/attractions.json";
			}
			if (_.isEqual(key, "shopping")) {
				name = "facilities/shoppings.json";
			}
			if (_.isEqual(key, "hotel")) {
				name = "facilities/hotels.json";
			}
			if (_.isEqual(key, "other")) {
				name = "facilities/other_venues.json";
			}

			var deferred = $q.defer();
			$http.get(name).success(function(accessibleData) {
				var tmp = [];
				if (accessibleData) {
					var data = undefined;
					if (accessibleData.attractions) {
						data = accessibleData.attractions.locations;
					}
					if (accessibleData.hotels) {
						data = accessibleData.hotels.locations;
					}
					if (accessibleData['shopping-dining']) {
						data = accessibleData['shopping-dining'].locations;
					}
					if (accessibleData["other-venues"]) {
						data = accessibleData["other-venues"].locations;
					}
				   	var subResult = _.filter(data, function(d) {
				    		return _.isEqual(_.isNull(d['address-en']), false) &&
				    				_.isEqual(_.isEmpty(d['address-en']), false);
				    	});

				   	tmp = _.map(subResult, function(t) {
				   		return  {
				   			address_en : t['address-en'] + ", Hong Kong",
				   			address_zh_hk : t['address-zh-hk'],
				   			name_en : t['name-en'],
				   			name_zh_hk : t['name-zh-hk']
				   		};
				   	});
				}
				deferred.resolve(tmp);
			}).error(function(data) {
				deferred.reject([]);
			});
			return deferred.promise;
		}
	};
}])
.factory('GeocoderCache',  ['$localStorage', '$q', '$timeout', '$rootScope',
	function ($localStorage, $q, $timeout, $rootScope) {

		// https://gist.github.com/avaliani/10214857
		var locations = $localStorage.locations ? JSON.parse($localStorage.locations) : {};
		var queue = [];

		// Amount of time (in milliseconds) to pause between each trip to the
		// Geocoding API, which places limits on frequency.
//		var QUERY_PAUSE= 250;
		var QUERY_PAUSE= 200;

		/**
		* executeNext() - execute the next function in the queue.
		* If a result is returned, fulfill the promise.
		* If we get an error, reject the promise (with message).
		* If we receive OVER_QUERY_LIMIT, increase interval and try again.
		*/
		var executeNext = function () {
			var task = queue[0],
			geocoder = new google.maps.Geocoder();

			geocoder.geocode({ address : task.address }, function (result, status) {
				if (status === google.maps.GeocoderStatus.OK) {

					var parsedResult = {
						lat: result[0].geometry.location.lat(),
						lng: result[0].geometry.location.lng(),
						formattedAddress: result[0].formatted_address,
						name_en : task.name_en,
						name_zh_hk : task.name_zh_hk,
						address : task.address,
						address_zh_hk : task.address_zh_hk
					};
					locations[task.address] = parsedResult;

					$localStorage.locations = JSON.stringify(locations);

					queue.shift();
					task.d.resolve(parsedResult);

				} else if (status === google.maps.GeocoderStatus.ZERO_RESULTS) {
					queue.shift();
					task.d.reject({
						type: 'zero',
						message: 'Zero results for geocoding address ' + task.address
					});
				} else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
					//if (task.executedAfterPause) {
					//	queue.shift();
					//	task.d.reject({
					//		type: 'busy',
					//		message: 'Geocoding server is busy can not process address ' + task.address
					//	});
					//}
					QUERY_PAUSE += 100;
				} else if (status === google.maps.GeocoderStatus.REQUEST_DENIED) {
					queue.shift();
					task.d.reject({
						type: 'denied',
						message: 'Request denied for geocoding address ' + task.address
					});
				} else {
					queue.shift();
					task.d.reject({
						type: 'invalid',
						message: 'Invalid request for geocoding: status=' + status +
							', address=' + task.address
					});
				}

				if (queue.length) {
					if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
						//var nextTask = queue[0];
						//nextTask.executedAfterPause = true;
						$timeout(executeNext, QUERY_PAUSE);
					} else {
						$timeout(executeNext, 0);
					}
				}

				if (!$rootScope.$$phase) { $rootScope.$apply(); }
			});
		}; // end of executeNext

	return {
		geocodeAddress : function (addressObj) {
			var d = $q.defer();

			//if (_.has(locations, address)) {
			if (addressObj.address_en in locations) {
				d.resolve(locations[addressObj.address_en]);
			} else {
				queue.push({
					address: addressObj.address_en,
					address_zh_hk: addressObj.address_zh_hk,
					name_en: addressObj.name_en,
					name_zh_hk: addressObj.name_zh_hk,
					d: d
				});

				if (queue.length === 1) {
					executeNext();
				}
			}
			return d.promise;
		}
	};
}])
.factory('PlaceExplorer', ['$http', '$q', 'GeocoderCache',
	function($http, $q, GeocoderCache) {

	var getExploreImageUrl = function(loc, addressObj) {
		var d = $q.defer();
		var currLocation = loc;
    var auth = null;

		if (_.isNull(addressObj) || _.isUndefined(addressObj)) {
			return d.reject({url: "", loc : currLocation, lat: "N/A", lng: "N/A"});
		}

    $http.get('/app/config.json')
    .then(function(response) {
      auth = response.data;
      return GeocoderCache.geocodeAddress(addressObj);
    })
    .then(function(data) {
          var credential = "&v=" + auth.version + "&client_id=" + auth.clientId + "&client_secret=" + auth.clientSecret;
          var exploreUrl = "https://api.foursquare.com/v2/venues/explore?callback=JSON_CALLBACK" + credential + "&ll=" + data.lat + ',' + data.lng + "&limit=1";
					$http.jsonp(exploreUrl)
					 	.then(function(imgData) {
                return _.isEqual(_.isNull(imgData), false) ? imgData.data.response.groups[0].items[0].venue.id || null : null;
            })
            .then(function(venueId) {
                return venueId ? $http.jsonp("https://api.foursquare.com/v2/venues/" + venueId + "/photos?limit=1&callback=JSON_CALLBACK" + credential) : null;
            })
            .then(function(photoData) {
              var firstItem = photoData && photoData.data && photoData.data.response && photoData.data.response.photos && photoData.data.response.photos.items[0] || null;
              if (firstItem) {
                var imgUrl = firstItem.prefix + "180x180" + firstItem.suffix;
                var result = { url: imgUrl, loc: currLocation
									, lat: parseFloat(data.lat).toFixed(4), lng: parseFloat(data.lng).toFixed(4) };
								d.resolve( result );
              } else {
                console.log("no image: [" + data.address + "]");
								var result = { url: "", loc: currLocation	, lat: parseFloat(data.lat).toFixed(4), lng: parseFloat(data.lng).toFixed(4) };
								d.resolve( result );
              }
            })
						.catch(function(err) {
							console.error("Error in PlaceExplorer Service get method.", err);
							d.reject({ url: "", loc: currLocation , lat: parseFloat(data.lat).toFixed(4), lng: parseFloat(data.lng).toFixed(4) });
						});
      })
      .catch(function(err) {
          console.error(err);
          d.reject({ url: "", loc: currLocation, lat: parseFloat(data.lat).toFixed(4), lng: parseFloat(data.lng).toFixed(4) });
      });
		return d.promise;
	};

	return {
		getImageUrl : getExploreImageUrl
	};
}]);
