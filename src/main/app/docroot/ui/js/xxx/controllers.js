(function () {
'use strict';

	var controllers = angular.module('alainn');


	controllers.controller('ApplicationControllerXXX', 
		function ($scope, $rootScope, $location, $http, URLS, $state, itemsManager, basketService, Session, AUTH_EVENTS, 
				AuthService, $modal, brandsManager, navigation, wishlistService, authenticationService) {
	$scope.user = {
		username: Session.getUser(),
		sessionIsActive: Session.isActive()
	}; 
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
		
		$scope.user.sessionIsActive = Session.isActive();
		
		basketService.loadAllItems().then(function(){
		    //$rootScope.$broadcast('basketLoaded');
		});
		wishlistService.loadAllItems().then(function(){
			$rootScope.$broadcast('wishlistLoaded');
		});
	});
	
	$scope.$on(AUTH_EVENTS.logoutSuccess, function(){
		$scope.user.username = '';
		$scope.user.sessionIsActive = Session.isActive();
		$state.go('login');
	});

	$scope.$on('basketLoaded', function() {
		$scope.basketItems = basketService._items;
    });
	
	$scope.logout = function(){
		if ( AuthService.logout() ){
			$rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
		};
	};
	

	
	$scope.search=function(search){
    	itemsManager.loadItems($scope.pageSize, $scope.pageIndex, search.query, search.brand).then(function(response) {
	        navigation.last('');
	        $location.path('/items');
	        $rootScope.$broadcast('pageLoaded', response);
	    });
    };
    
});



controllers.controller('HomeController', ['$scope', 
  function($scope) {
    
  }]);










controllers.controller('LoginController', function ($scope, $rootScope, $modal, AuthService, AUTH_EVENTS, $state, authenticationService) {
				$scope.registration = { 
						username: '', 
						password: '', 
						password2: '',
						userdata: {
					        "firstName" : "",
					        "lastName" : "",
					        "mobileNumber" : "",
					        "notificationPreferences": {
					           sms: false,
					           email: true,
					           web: false,
					           applePush: false
					        }
						}
					};
					
					
				$scope.onChange = function(){
					this.clearAlerts();
				}
				
				$scope.alerts = [
				                /*
				 { type: 'danger', msg: 'Oh snap! Change a few things up and try submitting again.' },
				 { type: 'success', msg: 'Well done! You successfully read this important alert message.' }
				 */
				];
				
				$scope.clearAlerts = function(){
					$scope.alerts = [];
				}
				
				$scope.closeAlert = function(index) {
				    $scope.alerts.splice(index, 1);
				  };
				               
				$scope.ok = function () {
					
					this.clearAlerts();
					$scope.alerts.push({msg: 'Registering..'});
					AuthService.register($scope.registration).then(function(regResults){
						$scope.clearAlerts();
						if ( regResults.succesful ){
							$scope.alerts.push({type: 'success', msg: 'Welcome' });
							$rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
							authenticationService.requestCode();
						}else{
							$scope.alerts.push({type: 'danger', msg: regResults.message });
							//$interval($scope.clearAlerts, 2200, 0);
							$rootScope.$broadcast(AUTH_EVENTS.loginFailed);
						}
							
					});
				};
			
				$scope.cancel = function () {
				    $modalInstance.dismiss('cancel');
				};
		});

controllers.controller('OrdersController', 
	function ($scope, $rootScope, AuthService, AUTH_EVENTS, ordersService) {
		ordersService.orders().then(function(data){
			$scope.orders = data;
			$scope.noOrders = (_.size($scope.orders)==0);	
		})
	}
	);

controllers.controller('OrdersDetailController', 
function ($scope, $rootScope, $stateParams, AuthService, AUTH_EVENTS) {
	$scope.order = {
         	id: 123123,
         	date: '2014-01-05',
         	total: 5223.2,
         	pickupLocation: 'Sears 1'
          };
	$scope.orderItems = [
			{
		        "links" : [
		          { "rel" : "image", "href" : "" },
		          { "rel" : "self", "href" : "http://alainn-cosmetics.cloudhub.io/api/v1.0/basket/12341324" },
		          { "rel" : "parent", "href" : "http://alainn-cosmetics.cloudhub.io/api/v1.0/basket" }
		        ],
		        "id" : "12341324",
		        "type" : "Creams",
		        "name" : "Dove",
		        "summary" : "Soap! Just plain old soap!",
		        "sku" : "12344",
		        "price" : 1.00,
		        "stockQuantity" : 1,
		        "quantity" : 2
		      },
		      {
		        "links" : [
		          { "rel" : "image", "href" : "" },
		          { "rel" : "self", "href" : "http://alainn-cosmetics.cloudhub.io/api/v1.0/basket/09878623" },
		          { "rel" : "parent", "href" : "http://alainn-cosmetics.cloudhub.io/api/v1.0/basket" }                
		        ],
		        "id" : "09878623",
		        "type" : "Creams",
		        "name" : "Dove",
		        "summary" : "Soap! Just plain old soap!",
		        "sku" : "12344",
		        "price" : 1.00,
		        "stockQuantity" : 1,
		        "quantity" : 1
		      }
	];

}
);


})();

