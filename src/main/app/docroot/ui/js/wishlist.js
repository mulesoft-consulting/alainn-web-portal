'use strict';

services.service('wishlistService', [ '$http', '$q', 'URLS', 'Sku',  function ($http, $q, URLS, Sku ) {
    var wishlistService = 
    {
      _items: {},
      
      itemCount: function(){
        return _.size(this._items);
      },
      _retrieveInstance: function(sku, itemData) {
          var instance = this._items[sku];

          if (instance) {
              instance.setData(itemData);
          } else {
              instance = new Sku(itemData);
              this._items[sku] = instance;
          }

          return instance;
      },
      findSku: function(sku){
    	  var instance = this._items[sku];
    	  return instance; 
      },
      loadAllItems: function() {
          var deferred = $q.defer();
          var scope = this;
          this._items = {};
          
          var params= { pageSize: 500, imageType: 'LargeImage' };

          $http( { method: 'GET', url: URLS.BASE_URL + 'wish-list/', params: params } )
              .success(function(data, status, headers, config) {
                   var items = []; 
                  data.collection.items.forEach(function(itemData) {

                      var item = scope._retrieveInstance(itemData.sku, itemData);
                      items.push(item);
                  });

                  deferred.resolve(items);
              })
              .error(function(data, status, headers, config) {
                //alert('err:'+JSON.stringify(config));
                  deferred.reject();
              });
          return deferred.promise;
      },
      
      addItem: function( sku ){
        var deferred = $q.defer();
        var scope = this;

        var wishlistItem = {
          'sku': sku
        };

        $http.post(URLS.BASE_URL + 'wish-list/', wishlistItem)
        	.success(function(data, status, headers, config) {
                deferred.resolve();
            })
            .error(function(data, status, headers, config) {
                alert("error adding item to wishlist: "+status);
                deferred.reject();
            });
        return deferred.promise;
      },
      removeItem: function(sku){
        var deferred = $q.defer();
        var scope = this;
        $http.delete(URLS.BASE_URL + 'wish-list/' + sku)
          .success(function(data, status, headers, config) {
                deferred.resolve();
            })
            .error(function(data, status, headers, config) {
                alert("error deleting item from wishlist:"+status);
                deferred.reject();
            });
        return deferred.promise;
      }
    }
    return wishlistService;
  }
]);