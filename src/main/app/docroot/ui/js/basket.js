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

services.service('basketService', [ '$http', '$q', 'URLS', 'BasketItem', 'Session', '$rootScope', function ($http, $q, URLS, BasketItem, Session, $rootScope) {
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
          
          $http( { url: URLS.BASE_URL + 'basket', method: 'GET' , cache: false} )
              .success(function(data, status, headers, config, statusText) {
                   var items = []; 
                   var i = 0;
                  data.collection.items.forEach(function(itemData) {
                      var item = scope._retrieveInstance(itemData.sku, itemData);
                      item.index=i;
                      i++;
                      items.push(item);
                  });
                  deferred.resolve(items);
                  $rootScope.$broadcast('basketLoaded');
              })
              .error(function(data, status, headers, config, statusText) {
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
        
        $http( { url:URLS.BASE_URL + 'basket/', method: 'POST', data:basketItem})
        	.success(function(data, status, headers, config) {
                deferred.resolve();
            })
            .error(function(data, status, headers, config) {
                alert("error adding item to basket: "+JSON.stringify(config));
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
      checkout: function(checkoutData){
        var deferred = $q.defer();
        var scope = this;

        var checkoutBasket = {
          "pickupLocation": checkoutData.pickuplocation,
          "items": []
        };

        for (var key in scope._items){
        	var bi = scope._items[key];
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