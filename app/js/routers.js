'use strict';

const  stateModule = angular.module('hkRouter', ['ui.router']);

stateModule
	.config(['$stateProvider', '$urlRouterProvider',
	  function($stateProvider, $urlRouterProvider) {

	    /////////////////////////////
	    // Redirects and Otherwise //
	    /////////////////////////////
	    $urlRouterProvider.otherwise("/attractions");

	    // state provider
	    $stateProvider
	      .state('attractions',
	          {
	            url: '/attractions',
	            templateUrl: 'partials/attraction.html',
	            resolve: {
	            	locationResult : [ 'Accessible', function(Accessible) {
	            		return Accessible.get('facilities/attractions.json', 'attractions');
	            	}],
					translateHeader: ['$translate', function($translate) {
							return $translate('ATTRACTION');
					}]
	            },
	            controller: 'AccessibleCtrl',
							controllerAs: 'vm'
	          })
	      .state('shopping_dining',
	          {
	            url: '/shopping_dining',
	            templateUrl: 'partials/attraction.html',
	            resolve: {
	            	locationResult : [ 'Accessible', function(Accessible) {
	            		return Accessible.get('facilities/shoppings.json', 'shopping-dining');
	            	}],
					translateHeader: ['$translate', function($translate) {
							return $translate('SHOPPING');
					}]
	            },
	            controller: 'AccessibleCtrl',
							controllerAs: 'vm'
	          })
	      .state('hotels',
	          {
	            url: '/hotels',
	            templateUrl: 'partials/attraction.html',
	            resolve: {
	            	locationResult : [ 'Accessible', function(Accessible) {
	            		return Accessible.get('facilities/hotels.json', 'hotels');
	            	}],
					translateHeader: ['$translate', function($translate) {
							return $translate('HOTEL');
					}]
	            },
	            controller: 'AccessibleCtrl',
							controllerAs: 'vm'
	          })
	      .state('other_venues',
	          {
	            url: '/other_venues',
	            templateUrl: 'partials/attraction.html',
	            resolve: {
	            	locationResult : [ 'Accessible', function(Accessible) {
	            		return Accessible.get('facilities/other_venues.json', 'other-venues');
	            	}],
					translateHeader: ['$translate', function($translate) {
							return $translate('OTHERVENUE');
					}]
	            },
	            controller: 'AccessibleCtrl',
							controllerAs: 'vm'
	          })
	    //   .state('geolocation',
	    //       {
	    //         url: '/geolocation',
	    //         templateUrl: 'partials/geolocation.html',
	    //         resolve: {
	    //         	locationResult : [ 'Accessible', function(Accessible) {
	    //         		return Accessible.get("facilities/shoppings.json","shopping-dining");
	    //         	}]
	    //         },
	    //         controller: 'MapCtrl',
		// 			controllerAs: 'vm'
	    //       })
	      .state('related_links',
	        {
	          url : '/links',
	          templateUrl : 'partials/link.html',
	          controller : 'LinkCtrl',
						controllerAs: 'vm'
	        });
	  }]);
