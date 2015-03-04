(function () {
	'use strict';
	var controllers = angular.module('alainn');

	controllers.controller('CatalogListCtrl', 
			  function($scope, $rootScope, $location, $stateParams, itemsManager, navigation, brandsManager, 
					  wishlistService, AUTH_EVENTS, sessionService, basketService, $timeout) {
				
				$rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
				$scope.nav = navigation;

				$scope.$on('pageLoaded', function(event, args){
			    	$scope.items = args.items;
			        $scope.browseLinks = args.links; 

			        navigation.setLinks(args.links);
			        
					$scope.nextPageLink = navigation.next();
			        $scope.prevPageLink = navigation.prev();
			        
			        $scope.hasNextPage = navigation.hasNext();
			        $scope.hasPrevPage = navigation.hasPrev();
			        
			        $scope.pageSize = navigation.pageSize();
			    	$scope.pageIndex = navigation.pageIndex();
			    	
			    	$scope.pageIndexRange = parseInt($scope.pageIndex)+parseInt($scope.pageSize);
				});
				
				if ( navigation._last!='' ){
				    itemsManager.loadItemsByUrl(navigation._last).then(function(response) {
				        $scope.$emit('pageLoaded', response);
				    });
				}else{
					itemsManager.loadItems($scope.pageSize, $scope.pageIndex).then(function(response) {
						navigation.last('');
				        $scope.$emit('pageLoaded', response);
				    });
				}
				
			    $scope.browse= function(direction){
			    	var newUrl = (direction=='next' ? $scope.nextPageLink.href : $scope.prevPageLink.href );
			    	
			    	itemsManager.loadItemsByUrl( newUrl ).then(function(response) {
			    		navigation.last(newUrl);
			            $scope.$emit('pageLoaded', response);
			        });
			    };
			    
			    //Details
			    $scope.skulist = [];
			    
			    $scope.canAddToWishlist = false;
				$scope.canAddToBasket = false;
				
				wishlistService.loadAllItems();
				
				$scope.$on('skuLoaded', function(){
			        $scope.qty = 1;
			        $scope.maxQty = $scope.sku.stockQuantity;
			        $scope.basketIconUrl = "img/cart-add.png";
			        $scope.setImage($scope.sku.firstImage());
			    	$scope.canAddToWishlist = !($scope.sku===undefined) && sessionService.isActive() && (wishlistService.findSku($scope.sku.sku)==null) ;
			        $scope.canAddToBasket = sessionService.isActive();
			        
			        //setTimeout(initCarousel, 100);
				});
				
				$scope.$on(AUTH_EVENTS.loginSuccess, function(){
			    	$scope.canAddToWishlist = !($scope.sku===undefined) && sessionService.isActive() && (wishlistService.findSku($scope.sku.sku)==null) ;
			        $scope.canAddToBasket = sessionService.isActive();
				});
				
				$scope.$on(AUTH_EVENTS.logoutSuccess, function(){
					$scope.canAddToWishlist = false;
					$scope.canAddToBasket = false;
				});
				
				$scope.$on('basketLoaded', function() {
			    });
				    
			    $scope.$on('wishlistLoaded', function(){
			    	$scope.canAddToWishlist = !($scope.sku===undefined) && sessionService.isActive() && (wishlistService.findSku($scope.sku.sku)==null) ;
			    });
				
			    $scope.selectItem = function(selectedItem){
			    	var scope = $scope;
			    	itemsManager.getItem(selectedItem.id).then(function(item) {
			            scope.item = item;
			            scope.mainImageUrl = item.getMainImageUrl();
			            scope.itemImages = item.getImagesUrl("SmallImage");

			            var sku  = item.getFirstSku();
			            scope.setCurrentSku(sku);
			            scope.skulist = item.getSkus();
			            
			            $timeout(initCarousel, 500);
			        });
			    	
			    	
			    }
			    
			    $scope.setImage = function(image) {
			        $scope.mainImageUrl = image.href;
			      };

			      $scope.setCurrentSku = function (sku){
			        $scope.sku = sku;
			        $rootScope.$broadcast('skuLoaded');
			      }


			      $scope.addToBasket = function(){
			      	var btn = $('#addToBasketButton');
			      	btn.button('loading');
			      	$('#menuBasket').popover('show');
			      	basketService.addItem( $scope.sku.sku, $scope.sku.price, $scope.qty ).then(function(data) {
			  			btn.button('reset');
			      		basketService.loadAllItems().then(function(){
			      			//$rootScope.$broadcast('basketLoaded');
			      		});
			        });
			      };
			      
			      $scope.addToWishlist= function() {
			      	var btn = $('#addToWishlistButton');
			      	btn.button('loading');

			    	  $('#menuWishlist').popover('show');
			      	wishlistService.addItem( $scope.sku.sku ).then(function(data) {
			        	  btn.button('reset');
			      		wishlistService.loadAllItems().then(function(){
			      			$rootScope.$broadcast('wishlistLoaded');
			      			$('#menuWishlist').popover('hide');
			      		});
			      		
			            });
			      };
			    
			  });
})();
