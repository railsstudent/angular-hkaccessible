'use strict';

var  stateModule = angular.module('hkRouter', ['ui.router']);

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
	            controller: 'AttractionCtrl'
	          })
	      .state('shopping_dining', 
	          { 
	            url: '/shopping_dining',
	            templateUrl: 'partials/shopping.html',
	            controller: 'ShopDineCtrl'
	          })
	      .state('hotels', 
	          { 
	            url: '/hotels',
	            templateUrl: 'partials/hotel.html',
	            controller: 'HotelCtrl'
	          })
	      .state('other_venues', 
	          { 
	            url: '/other_venues',
	            templateUrl: 'partials/other.html',
	            controller: 'VenueCtrl'
	          })
	      .state('geolocation', 
	          { 
	            url: '/geolocation',
	            templateUrl: 'partials/geolocation.html',
	            controller: 'MapCtrl'
	          })
	      .state('related_links', 
	        {
	          url : '/links',
	          templateUrl : 'partials/link.html',
	          controller : 'MiscCtrl'
	        });
	  }]);