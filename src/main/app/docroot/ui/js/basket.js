'use strict';


services.factory('BasketItem', [  function( ){
    function BasketItem(itemData){
        if (itemData) {
            this.setData(itemData);
        }
    };
    BasketItem.prototype = {
        setData: function(itemData) {
            angular.extend(this, itemData);
        },
        
        getThumbUrl: function(){
            var image = _.findWhere( this.links, { "rel": "SmallImage" } );
            return image === undefined ? "" : image.href;
        },

        getMainImageUrl: function(){
            var image = _.findWhere( this.links, { "rel": "LargeImage" } );
            return image === undefined ? "" : image.href;
        },

        getImagesUrl: function(size){
          var urls = _.where( this.links, { "rel": size} );
          return urls; 
        }

        
    };
    return BasketItem;

}]);

services.service('basketService', [ '$http', '$q', 'URLS', 'BasketItem', 'Session', function ($http, $q, URLS, BasketItem, Session) {
    var basketService = 
    {
      _items: {},
        _retrieveInstance: function(itemId, itemData) {
            var instance = this._items[itemId];

            if (instance) {
                instance.setData(itemData);
            } else {
                instance = new BasketItem(itemData);
                this._items[itemId] = instance;
            }

            return instance;
        },
      itemCount: function(){
        return _.size(this._items);
      },
      findSku: function(sku){
    	  var instance = this._items[sku];
    	  return instance; 
      },
      loadAllItems: function() {
          var deferred = $q.defer();
          var scope = this;
          this._items = {};
          deferred.resolve(scope._items);
          
          $http.get(URLS.BASE_URL + 'basket/')
              .success(function(data, status, headers, config) {
                   var items = []; 
                  data.collection.items.forEach(function(itemData) {
                      var item = scope._retrieveInstance(itemData.sku, itemData);
                      items.push(item);
                  });
                  deferred.resolve(items);
              })
              .error(function(data, status, headers, config) {
                  deferred.reject();
              });
              
          return deferred.promise;
      },
      
      addItem: function(sku, price, quantity){
        var deferred = $q.defer();
        var scope = this;

        var basketItem = {
          'sku': sku,
          'quantity': quantity,
          'price': price
        };
        
        var headers = {
        		'Content-Type': 'application/json',
        		Accept: 'application/json'
        			
        		//,'Cache-Control': 'no-cache'
        		//,'Accept': '*/*'
        		//,'x-user-id': Session.getUser() 
        		//,'access_token':  Session.getToken()
        }

        $http( { url:URLS.BASE_URL + 'basket/', method: 'POST', data: basketItem, headers: headers, cache:false})
        	.success(function(data, status, headers, config) {
                deferred.resolve();
            })
            .error(function(data, status, headers, config) {
                alert("error adding item to basket: "+status);
                deferred.reject();
            });
        return deferred.promise;
      },
      updateItem: function(sku, price, quantity){
        /*var deferred = $q.defer();
        var scope = this;

        var basketItem = {
          'sku': sku,
          'quantity': quantity,
          'price': price
        };

        $http.put(URLS.BASE_URL + 'basket/' + sku, basketItem)
          .success(function(data, status, headers, config) {
                deferred.resolve();
            })
            .error(function(data, status, headers, config) {
                alert("error updating item in basket:"+status);
                deferred.reject();
            });
        return deferred.promise;*/
      },
      removeItem: function(sku){
        var deferred = $q.defer();
        var scope = this;
        $http.delete(URLS.BASE_URL + 'basket/' + sku)
          .success(function(data, status, headers, config) {
                deferred.resolve();
            })
            .error(function(data, status, headers, config) {
                alert("error deleting item to basket:"+status);
                deferred.reject();
            });
        return deferred.promise;
      },
      checkout: function(){
        var deferred = $q.defer();
        var scope = this;

        var checkoutBasket = {
          "pickupLocation": "Buenos Aires",
          "items": []
        };

        for(var bi in scope._items){
            var item = {
              "sku": bi.sku,
              "quantity": bi.quantity,
              "price": bi.price
            }
            checkoutBasket.items.push(item);
        };
        
        $http.post(URLS.BASE_URL + 'basket/checkout', checkoutBasket )
          .success(function(data, status, headers, config) {
                deferred.resolve();
            })
            .error(function(data, status, headers, config) {
                alert("error checking out basket");
                deferred.reject();
            });
        
        return deferred.promise;
      }
    }
    return basketService;
  }
]);