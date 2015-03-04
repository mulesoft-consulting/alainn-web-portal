(function () {
	'use strict';
	var app = angular.module('alainn');

	app.controller('WishlistCtrl', ['$scope', '$rootScope', 'wishlistService',
	                                        function($scope, $rootScope, wishlistService) {
	                                      	$scope.isEmpty = true;
	                                      	
	                                      	$scope.$on('wishlistLoaded', function(){
	                                      		$scope.wishlist = wishlistService._items;
	                                      	    $scope.isEmpty = wishlistService.itemCount()==0;
	                                        		$('#menuWishlist').popover('hide');
	                                      	});
	                                      	
	                                      	$scope.removeFromWishlist = function(sku){
	                                      		$('#menuWishlist').popover('show');
	                                      		wishlistService.removeItem(sku.sku).then(function(){
	                                      			wishlistService.loadAllItems().then(function(){
	                                      				$rootScope.$broadcast('wishlistLoaded');
	                                      			});
	                                      		});
	                                      	};

	                                      	wishlistService.loadAllItems().then(function(){
	                                      		$rootScope.$broadcast('wishlistLoaded');
	                                      	});
	                                        }
	                                        ]);
	
})();
