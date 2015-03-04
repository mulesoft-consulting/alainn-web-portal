(function () {
	'use strict';
	var app = angular.module('alainn');
	
	
	
	app.controller('NavbarController', ['$scope', 'basketService', 'wishlistService' ,
	  function($scope, basketService, wishlistService) {
	    $scope.title = "hola";
	    $scope.basketItemCount = 0;
	    $scope.wishlistItemCount = 0;
	    
	    $scope.$on('basketLoaded', function() {
	      $scope.basketItemCount = basketService.itemCount();
	      $('#menuBasket').popover('hide');
	    });
	    
	    $scope.$on('wishlistLoaded', function(){
	    	$scope.wishlistItemCount = wishlistService.itemCount();
	    	$('#menuWishlist').popover('hide');
	    });
	  }
	]);

})();
