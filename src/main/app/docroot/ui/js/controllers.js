'use strict';

/* Controllers */

var controllers = angular.module('controllers', []);


controllers.controller('ApplicationController', 
		function ($scope, $rootScope, $location, $http, URLS, $state, itemsManager, basketService, Session, AUTH_EVENTS, 
				AuthService, $modal, brandsManager, navigation, wishlistService) {
	$scope.user = {
		username: Session.getUser(),
		sessionIsActive: Session.isActive()
	}; 
	$scope.brands = [];
	
	basketService.loadAllItems().then(function(){
	    //$rootScope.$broadcast('basketLoaded');
	});
	
	wishlistService.loadAllItems().then(function(){
		$rootScope.$broadcast('wishlistLoaded');
	});
	

    brandsManager.findAll().then(function(response){
    	$scope.brands = response;
    });
	
	$scope.$on(AUTH_EVENTS.loginSuccess, function(){
		$scope.user.username = Session.getUser();
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
	    });

	    modalInstance.result.then(function (credentials) {
	    	
	    }, function () {
	    	
	    });

	};
	

	
	$scope.search=function(search){
    	itemsManager.loadItems($scope.pageSize, $scope.pageIndex, search.query, search.brand).then(function(response) {
	        navigation.last('');
	        $location.path('/items');
	        $rootScope.$broadcast('pageLoaded', response);
	    });
    };
    
});

controllers.controller('NavbarController', ['$scope', 'basketService', 'wishlistService' ,
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

controllers.controller('HomeController', ['$scope', 
  function($scope) {
    
  }]);

controllers.controller('CatalogListCtrl', 
  function($scope, $rootScope, $location, $stateParams, itemsManager, navigation, brandsManager, 
		  wishlistService, AUTH_EVENTS, Session, basketService, $timeout) {
	
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
    	newUrl = newUrl.replace( 'localhost:8082', 'alainn-api-qa.qa2.cloudhub.io');
    	newUrl = newUrl.replace( ':8082', '');

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
    	$scope.canAddToWishlist = !($scope.sku===undefined) && Session.isActive() && (wishlistService.findSku($scope.sku.sku)==null) ;
        $scope.canAddToBasket = Session.isActive();
        
        //setTimeout(initCarousel, 100);
	});
	
	$scope.$on(AUTH_EVENTS.loginSuccess, function(){
    	$scope.canAddToWishlist = !($scope.sku===undefined) && Session.isActive() && (wishlistService.findSku($scope.sku.sku)==null) ;
        $scope.canAddToBasket = Session.isActive();
	});
	
	$scope.$on(AUTH_EVENTS.logoutSuccess, function(){
		$scope.canAddToWishlist = false;
		$scope.canAddToBasket = false;
	});
	
	$scope.$on('basketLoaded', function() {
    });
	    
    $scope.$on('wishlistLoaded', function(){
    	$scope.canAddToWishlist = !($scope.sku===undefined) && Session.isActive() && (wishlistService.findSku($scope.sku.sku)==null) ;
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

controllers.controller('BasketCtrl', ['$scope', '$rootScope', 'basketService',  '$modal', 
  function($scope, $rootScope, basketService,  $modal) {
      $scope.checkoutDisabled = (basketService.itemCount()==0);

      $scope.$on('basketLoaded', function() {
        $scope.basketItems = basketService._items;
        $scope.checkoutDisabled = (basketService.itemCount()==0);
  		$('#menuBasket').popover('hide');
  		
      });

      $scope.checkout = function() {
    	  $("#checkoutButton").button('loading');
//    	  basketService.checkout().then( function() {
//    		  basketService.loadAllItems().then(function(){
//    			  $("#checkoutButton").button('reset');
//    		  });
//    	  });
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


var ModalCheckoutController = function ($scope, $rootScope, $modal, $modalInstance, $interval, AuthService, AUTH_EVENTS) {

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



controllers.controller('WishlistCtrl', ['$scope', '$rootScope', 'wishlistService',
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


controllers.controller('LoginController', 
		function ($scope, $rootScope, $modal, AuthService, AUTH_EVENTS) {
			$scope.credentials = { username: '', password: '' };
			$scope.ok = function(credentials){
				if ( AuthService.login(credentials) ){
				    $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
				} else{
					$rootScope.$broadcast(AUTH_EVENTS.loginFailed);
				}
			};
			$scope.register = function (size) {
			    var modalInstance = $modal.open({
			      templateUrl: 'modal.registration.html',
			      controller: ModalRegistrationController,
			      size: size
			    });

			    modalInstance.result.then(function (registration) {
			    	alert('reg:'+JSON.stringify(registration));
			    	$scope.credentials.username = registration.username;
			    	$scope.credentials.password = registration.password;
			    }, function () {
			    	//$log.info('Modal dismissed at: ' + new Date());
			    });
			};
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



