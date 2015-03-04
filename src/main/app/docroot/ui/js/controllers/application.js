(function () {
'use strict';

	var app = angular.module('alainn');


	app.controller('ApplicationController', ['$scope', 'sessionService', 'AUTH_EVENTS', 'brandsManager', '$rootScope', 'basketService', 'authenticationService', '$state', 'wishlistService', 'userService', 'itemsManager', 'navigation',
	                                         function($scope, sessionService, AUTH_EVENTS, brandsManager, $rootScope, basketService, authenticationService, $state, wishlistService, userService, itemsManager, navigation) {
		$scope.user = {
			username: '',
			sessionIsActive: sessionService.isActive()
		}; 
		
		$scope.username= 'User';
		$scope.brands = [];
	   
		$scope.$on(AUTH_EVENTS.loginSuccess, function(){
			 brandsManager.findAll().then(function(response){
			    	$scope.brands = response;
			    });
				
			basketService.loadAllItems().then(function(){
			    //$rootScope.$broadcast('basketLoaded');
			});
			
			wishlistService.loadAllItems().then(function(){
				$rootScope.$broadcast('wishlistLoaded');
			});
			
			$scope.user.sessionIsActive = sessionService.isActive();
			var user = sessionService.getUser();
			if (!user) {
				userService.getUser().then(function(data) {
					$scope.username = data;
				});
			} else {
				$scope.username = user;
			}
			
			basketService.loadAllItems().then(function(){
			    //$rootScope.$broadcast('basketLoaded');
			});
			wishlistService.loadAllItems().then(function(){
				$rootScope.$broadcast('wishlistLoaded');
			});
		});
		
		$scope.$on(AUTH_EVENTS.logoutSuccess, function(){
			$scope.user.username = '';
			$scope.user.sessionIsActive = sessionService.isActive();
			$state.go('login');
		});
		
		$scope.$on(AUTH_EVENTS.notAuthenticated, function() {
			sessionService.destroy();
			authenticationService.requestCode();
		});

		$scope.$on('basketLoaded', function() {
			$scope.basketItems = basketService._items;
	    });
		
		$scope.logout = function(){
			authenticationService.logout();
			$rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
		};
		
		$scope.login = function (size) {
//		      // Call PingFederate SignIn
	      authenticationService.requestCode();


		};

		$scope.search=function(search){
	    	itemsManager.loadItems($scope.pageSize, $scope.pageIndex, search.query, search.brand).then(function(response) {
		        navigation.last('');
		        $state.go('items');
		        $scope.$broadcast('pageLoaded', response);
		    });
	    };
	}]);

})();






