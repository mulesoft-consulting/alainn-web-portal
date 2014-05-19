'use strict';

/* App Module */

var app = angular.module('myApp', [
  'ngRoute',
  //'ngStorage',
  'ui.router',
  'ngTouch',
  'ui.bootstrap',
  'underscore',
  'xeditable', 
  'controllers',
  'services',
  'filters',
  'animations',
  'ngMessages'
]);



app.constant( 'URLS', {
	BASE_URL: 'https://alainn-api-stg.stg.cloudhub.io/omni-channel-api/v1.0/'
	, OPEN_URL: 'https://alainn-api-stg.stg.cloudhub.io/open/omni-channel-api/v1.0/'
	, ACCESS_TOKEN: 'http://alainn-api-stg.stg.cloudhub.io/access-token'

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


app.factory('AuthInterceptor', function ($rootScope, $q, Session) {
	return {
		// optional method
		request: function(config) {
	        // do something on success
			
			if ( Session.isActive() ){
				var user = Session.getUser();
				var token = Session.getToken();
				config.headers['x-user-id']=user;
				config.headers['access_token']=token;
			}
			
			return config || $q.when(config);
		}
	}
});


	
	
app.config([ '$routeProvider', '$stateProvider', '$urlRouterProvider',
  function(  $routeProvider, $stateProvider, $urlRouterProvider ) {
	
		$urlRouterProvider
		.when('', '/items');
		   // For any unmatched url, send to /route1
	      $urlRouterProvider.otherwise("/items");

      $stateProvider
        .state('login', {
            url: "/login",
            templateUrl: "partials/login.html",
            controller: 'LoginController'
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
          authenticate: false
        })
        ;
  }]);

app.run( function($rootScope, $state, $location, AuthService, AUTH_EVENTS ) {

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    	var authenticate = ( !(toState.authenticate===undefined) && toState.authenticate);

    	$rootScope.currentState = toState.url;
    	$rootScope.current = $location.$$url;
	  	
    	
    	if ( authenticate && !AuthService.isAuthenticated() ){
        	// User isn’t authenticated
    		$rootScope.toState = toState.name;
    		$rootScope.fromState = fromState.name;
    		$location.path('/login');
          }
    });
    $rootScope.$on(AUTH_EVENTS.loginSuccess, function(){
		var url = ($rootScope.toState === undefined ? "items": $rootScope.toState);
		//$state.transitionTo(url);
	});
    $rootScope.$on(AUTH_EVENTS.logoutSuccess, function(){
    	var isProtected = ( !($state.current.authenticate===undefined) && $state.current.authenticate);
    	if (isProtected)
    		$state.go('items');
	});
});

app.config(function ($httpProvider) {
  $httpProvider.interceptors.push([
    '$injector',
    function ($injector) {
      return $injector.get('AuthInterceptor');
    }
  ]);
});





