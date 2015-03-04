(function () {
	'use strict';
	var controllers = angular.module('alainn');

	controllers.controller('BasketCtrl', ['$scope', '$rootScope', 'basketService',  '$modal', function($scope, $rootScope, basketService,  $modal) {
          $scope.checkoutDisabled = (basketService.itemCount()==0);

          $scope.$on('basketLoaded', function() {
            $scope.basketItems = basketService._items;
            $scope.checkoutDisabled = (basketService.itemCount()==0);
      		$('#menuBasket').popover('hide');
      		
          });

          $scope.checkout = function() {
        	  $("#checkoutButton").button('loading');
//	                                        	  basketService.checkout().then( function() {
//	                                        		  basketService.loadAllItems().then(function(){
//	                                        			  $("#checkoutButton").button('reset');
//	                                        		  });
//	                                        	  });
    		    var modalInstance = $modal.open({
    		      templateUrl: 'checkout.modal.html',
    		      controller: ModalCheckoutController
    		    });

    		    modalInstance.result.then(function (checkoutData) {
    		    	$("#checkoutButton").button('reset');
    	    	  basketService.checkout(checkoutData).then( function() {
    	    		  basketService.loadAllItems().then(function(){
    	    			  //$("#checkoutButton").button('reset');
    	    		  });
    	    	  });
    		    }, function () {
    		    	$("#checkoutButton").button('reset');
    		    	//$log.info('Modal dismissed at: ' + new Date());
    		    });
          }

          $scope.removeFromBasket= function(basketItem) {
        	$('#deleteFromBasketButton-'+basketItem.index).button('loading');
          	
        	basketService.removeItem(basketItem.sku).then( function(data) {
                basketService.loadAllItems().then(function(){
                  //$rootScope.$broadcast('basketLoaded');
                });
            });
          };

          $scope.updateQuantity = function( basketItem, quantity) {
            //1. remove item, 
        	//2. add item
        	  
        	  basketService.removeItem(basketItem.sku).then( function(data) {
        		  basketService.addItem( basketItem.sku, quantity, basketItem.price ).then(function(data) {
    		            basketService.loadAllItems().then(function(){
    		              //$rootScope.$broadcast('basketLoaded');
    		            });
    		        });
        	  		});
          };
          
          basketService.loadAllItems();
      }]);


    var ModalCheckoutController = function ($scope, $rootScope, $modal, $modalInstance, $interval, AUTH_EVENTS) {

    	$scope.checkout = { pickuplocation: '' };
    	$scope.message = "";
    	
    	$scope.onChange = function(){
    		this.clearAlerts();
    	}
    	
    	$scope.alerts = [];
    	
    	$scope.clearAlerts = function(){
    		$scope.alerts = [];
    	}
    	
    	$scope.closeAlert = function(index) {
    	    $scope.alerts.splice(index, 1);
    	  };
    	               
    	$scope.ok = function () {
    		this.clearAlerts();
    		$scope.alerts.push({msg: 'Checking out..'});
    		$modalInstance.close($scope.checkout);
    	};

    	$scope.cancel = function () {
    	    $modalInstance.dismiss('cancel');
    	};
    	
    	$scope.register = function (size) {
    	    var modalInstance = $modal.open({
    	      templateUrl: 'modal.registration.html',
    	      controller: ModalRegistrationController,
    	      size: size
    	    });

    	    modalInstance.result.then(function (registration, result) {
    	    	$scope.credentials.username = registration.username;
    	    	$scope.credentials.password = registration.password;
    	    	$scope.ok();
    	    }, function () {
    	    	//$log.info('Modal dismissed at: ' + new Date());
    	    });
    	};
    };
})();
