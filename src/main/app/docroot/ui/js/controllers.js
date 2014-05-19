'use strict';

/* Controllers */

var controllers = angular.module('controllers', []);


controllers.controller('ApplicationController', 
		function ($scope, $rootScope, itemsManager, basketService, Session, AUTH_EVENTS, AuthService, $modal) {
	$scope.user = {
		username: Session.get(),
		sessionIsActive: Session.isActive()
	} 
	  	
	basketService.loadAllItems().then(function(){
	    $rootScope.$broadcast('basketLoaded');
	});

	$scope.$on(AUTH_EVENTS.loginSuccess, function(){
		$scope.user.username = Session.get();
		$scope.user.sessionIsActive = Session.isActive();
	});
	$scope.$on(AUTH_EVENTS.logoutSuccess, function(){
		$scope.user.username = '';
		$scope.user.sessionIsActive = Session.isActive();
	});

	$scope.$on('basketLoaded', function() {
		$scope.basketItems = basketService._items;
    });
	
	$scope.logout = function(){
		if ( AuthService.logout() ){
			$rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
		};
	};
	
	$scope.login = function (size) {
	    var modalInstance = $modal.open({
	      templateUrl: 'modal.login.html',
	      controller: ModalLoginController,
	      size: size
	      /*,
	      resolve: {
	        items: function () {
	          return $scope.items;
	        }
	      }*/
	    });

	    modalInstance.result.then(function (credentials) {
	    	//
	    }, function () {
	    	//$log.info('Modal dismissed at: ' + new Date());
	    });
	};
	
});

controllers.controller('NavbarController', ['$scope', 'basketService', 
  function($scope, basketService) {
    $scope.title = "hola";
    
    $scope.$on('basketLoaded', function() {
      $scope.basketItemCount = basketService.itemCount();

    });
  }
]);

controllers.controller('HomeController', ['$scope', 
  function($scope) {
    
  }]);

controllers.controller('CatalogListCtrl', ['$scope', '$location', '$stateParams', 'itemsManager', 'navigation', 'brandsManager', 
  function($scope, $location, $stateParams, itemsManager, navigation, brandsManager) {
	
	$scope.nav = navigation;

	$scope.$on('pageLoaded', function(){
		navigation.setLinks($scope.browseLinks);
        
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
	        $scope.items = response.items;
	        $scope.browseLinks = response.links; 
	        $scope.$emit('pageLoaded');
	    });
	}else{
		itemsManager.loadItems($scope.pageSize, $scope.pageIndex).then(function(response) {
	        $scope.items = response.items;
	        $scope.browseLinks = response.links; 
	        $scope.$emit('pageLoaded');
	    });
	}
	
    $scope.browse= function(direction){
    	var newUrl = (direction=='next' ? $scope.nextPageLink.href : $scope.prevPageLink.href );
    	newUrl = newUrl.replace( 'localhost:8082', 'alainn-api-qa.qa2.cloudhub.io')

    	itemsManager.loadItemsByUrl( newUrl ).then(function(response) {
    		navigation.last(newUrl);
            $scope.items = response.items;
            $scope.browseLinks = response.links; 
            $scope.$emit('pageLoaded');
        });
    };
    
    $scope.submit=function(){
    	itemsManager.loadItems($scope.pageSize, $scope.pageIndex, $scope.query, $scope.brand).then(function(response) {
	        $scope.items = response.items;
	        $scope.browseLinks = response.links; 
	        $scope.$emit('pageLoaded');
	    });
    };
    
    brandsManager.findAll().then(function(response){
    	$scope.brands = response;
    });
    
  }]);

controllers.controller('CatalogDetailCtrl', ['$scope', '$rootScope', '$location', '$stateParams', 'itemsManager', 'basketService', 'wishlistService', 
  function($scope, $rootScope, $location, $stateParams, itemsManager, basketService, wishlistService ) {
	$scope.$on('skuLoaded', function(){
        $scope.qty = 1;
        $scope.maxQty = $scope.sku.stockQuantity;
        $scope.basketIconUrl = "img/cart-add.png";
        $scope.setImage($scope.sku.firstImage());
        //$scope.addToBasketDisabled = (basketService.findSku($scope.sku.sku)===undefined);
        $scope.skuInWishlist = (wishlistService.findSku($scope.sku.sku)!=null);
	});
	
	wishlistService.loadAllItems();
	
    itemsManager.getItem($stateParams.itemId).then(function(item) {
          $scope.item = item;
          $scope.mainImageUrl = item.getMainImageUrl();
          $scope.itemImages = item.getImagesUrl("SmallImage");

          var sku  = item.getFirstSku();
          $scope.setCurrentSku(sku);
      });
  

    $scope.setImage = function(image) {
      $scope.mainImageUrl = image.href;
    };

    $scope.setCurrentSku = function (sku){
      $scope.sku = sku;
      $scope.$broadcast('skuLoaded');
    }

    $scope.addToBasket = function(){
      //$scope.basketIconUrl = "img/cart-add-disabled.png";
      //$scope.addToBasketDisabled = true;

      basketService.addItem( $scope.sku.sku, $scope.sku.price, $scope.qty ).then(function(data) {
        basketService.loadAllItems().then(function(){
          $rootScope.$broadcast('basketLoaded');
        });
      });
    };
    
    $scope.addToWishlist= function() {
    	wishlistService.addItem( $scope.sku.sku ).then(function(data) {
    		wishlistService.loadAllItems().then(function(){
    			$scope.$broadcast('skuLoaded');
    		});
    		
          });
    };

    


  }]);

controllers.controller('BasketListOnFooterController', ['$scope', '$rootScope', 'basketService', 
  function($scope, $rootScope, basketService){
	
	$scope.checkoutDisabled = (basketService.itemCount()==0);
    
    $scope.$on('basketLoaded', function() {
      $scope.basketItems = basketService._items;
      $scope.checkoutDisabled = (basketService.itemCount()==0);
    });

    $scope.removeFromBasket= function(basketItem) {
      basketService.removeItem(basketItem).then( function(data) {
          basketService.loadAllItems().then(function(){
            $rootScope.$broadcast('basketLoaded');
          });
      });
    };
    
}])


controllers.controller('BasketCtrl', ['$scope', '$rootScope', 'basketService', 
  function($scope, $rootScope, basketService) {
      $scope.checkoutDisabled = (basketService.itemCount()==0);

      $scope.$on('basketLoaded', function() {
        $scope.basketItems = basketService._items;
        $scope.checkoutDisabled = (basketService.itemCount()==0);
      });

      $scope.checkout = function() {
        basketService.checkout().then( function() {
          //alert('checked out');
          basketService.loadAllItems().then(function(){
              $rootScope.$broadcast('basketLoaded');
              //$scope.basketItems = basketService._items;
            });
        });
      }

      $scope.removeFromBasket= function(basketItem) {
        basketService.removeItem(basketItem.sku).then( function(data) {
            basketService.loadAllItems().then(function(){
              $rootScope.$broadcast('basketLoaded');
              //$scope.basketItems = basketService._items;
            });
        });
      };

      $scope.updateQuantity = function( basketItem, quantity) {
        //1. remove item, 
    	//2. add item
    	  
    	  basketService.removeItem(basketItem.sku).then( function(data) {
    		  basketService.addItem( basketItem.sku, quantity, basketItem.price ).then(function(data) {
		            basketService.loadAllItems().then(function(){
		              $rootScope.$broadcast('basketLoaded');
		            });
		        });
    	  		});
      };
  }]);

controllers.controller('WishlistCtrl', ['$scope', 'wishlistService',
  function($scope, wishlistService) {
	$scope.$on('wishlistLoaded', function(){
		$scope.wishlist = wishlistService._items;
	    $scope.isEmpty = wishlistService.itemCount()==0;
	});
	
	$scope.removeFromWishlist = function(sku){
		wishlistService.removeItem(sku.sku).then(function(){
			wishlistService.loadAllItems().then(function(){
				$scope.$broadcast('wishlistLoaded');
			});
		});
	};

	wishlistService.loadAllItems().then(function(){
		$scope.$broadcast('wishlistLoaded');
	});
  }
  ]);


controllers.controller('LoginController', 
		function ($scope, $rootScope, AuthService, AUTH_EVENTS) {
			$scope.credentials = { username: 'a name', password: 'a password' };
			$scope.login = function(credentials){
				if ( AuthService.login(credentials) ){
				    $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
				} else{
					$rootScope.$broadcast(AUTH_EVENTS.loginFailed);
				}
			}
		}
	);

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



