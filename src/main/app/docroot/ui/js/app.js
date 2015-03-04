(function () {
'use strict';

	var app = angular.module('alainn', ['ngRoute', 'ui.router', 'ui.bootstrap', 'xeditable']);
		
	app.config([ '$routeProvider', '$stateProvider', '$urlRouterProvider', function($routeProvider, $stateProvider, $urlRouterProvider) {
		
		$urlRouterProvider
			.when('', '/items');
		  
		$stateProvider
		    .state('login', {
				url: "/login",
				templateUrl: "partials/login.html",
				controller: 'loginController'
				})
			.state('items', {
	            url: "/items",
	            templateUrl: "partials/item-list.html",
	            controller: 'CatalogListCtrl'
	        })
	        .state('items/item', {
	            url: "/items/:itemId",
	            templateUrl: "partials/item-detail.html",
	            controller: 'CatalogDetailCtrl'
	        })
	        .state('basket', {
	          url: "/basket",
	          templateUrl: 'partials/basket.html',
	          controller: 'BasketCtrl',
	          authenticate: true
	        })
	        .state('orders', {
	            url: "/orders",
	            templateUrl: 'partials/orders.html',
	            controller: 'OrdersController',
	            authenticate: true
	          })
	        .state('orders/order', {
	            url: "/orders/:orderId",
	            templateUrl: 'partials/order-detail.html',
	            controller: 'OrdersDetailController',
	            authenticate: true
	          })
	        .state('wishlist', {
	          url: "/wishlist",
	          templateUrl: 'partials/wishlist.html',
	          controller: 'WishlistCtrl',
	          authenticate: true
	        })
	        /*
			 * Following state presuppose that server-side redirects will be configured.
			 * These are implemented by the /auth flow in Mule
			 * See https://github.com/angular-ui/ui-router/wiki/Frequently-Asked-Questions#how-to-configure-your-server-to-work-with-html5mode
			 */
			.state('auth-code', {
				url: '/auth?token&state',
				onEnter: function($state, $stateParams, sessionService, $rootScope, AUTH_EVENTS) {
					// store the token. This will be picked up by our authInterceptor. See nzp-security module.
					sessionService.create($stateParams.token);
					$rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
					$state.go('items');
				}
			})
			.state('error', {
				url: '/auth?error',
				onEnter: function($state, $stateParams) {
					$state.go('login', $stateParams.error);
				}
			});
	}]);
	
	app.constant( 'URLS', {
		BASE_URL: 'https://alainn-omni-channel-api.cloudhub.io/v1.0/', 
		REG_URL: 'https://alainn-registration-api.cloudhub.io/v1.0/'
	});
	
	app.constant('AUTH_EVENTS', {
		  loginSuccess: 'auth-login-success',
		  loginFailed: 'auth-login-failed',
		  logoutSuccess: 'auth-logout-success',
		  sessionTimeout: 'auth-session-timeout',
		  notAuthenticated: 'auth-not-authenticated',
		  notAuthorized: 'auth-not-authorized',
		  registrationSuccess: 'registration-success',
		  registrationFailed: 'registration-failed'
	});
	
	// Code to call upon http interception
	app.factory('httpInterceptor', function authInterceptor(sessionService, $rootScope, AUTH_EVENTS) {
    	return {
    		// Override request method to add the Authorization header to all requests
    		request: function request(config) {
				config.headers = config.headers || {};
				if (sessionService.isActive()) {
					config.headers.Authorization = 'Bearer ' + sessionService.getToken();
				}
				return config;
    		},
    		
    	   responseError: function(rejection) {
    	      if (rejection.status === 401 || rejection.status === 403) {
    	    	  $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
    	      } else if (rejection.status === 400) {
    	    	  if ('invalid_grant' === rejection.data.error) {
    	    		  $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
    	    	  }
    	      }
    	      return rejection;
    	    }
    	};
    });
	
	// Make every http request intercepted with authInterceptor
	app.config(function config($httpProvider) {
		$httpProvider.interceptors.push('httpInterceptor');
	});
	  
	
	app.run( function($modal, $rootScope, $state, $location, editableOptions, editableThemes ) {

		  editableThemes.bs3.inputClass = 'input-sm';
		  editableThemes.bs3.buttonsClass = 'btn-sm';
		  editableOptions.theme = 'bs3';
		    
	});

})();





