'use strict';


services.factory('orderItem', [ function( ){
    function OrderItem(itemData){
        if (itemData) {
            this.setData(itemData);
        }
    };
    OrderItem.prototype = {
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
    return OrderItem;

}]);

services.service('ordersService', [ '$http', '$q', 'URLS', 'orderItem', function ($http, $q, URLS, orderItem) {
    var ordersService = 
    {
      orders: function() {
          var deferred = $q.defer();
          var scope = this;
          
          var items = [
                       {
                        	id: 123123,
                        	date: '2014-01-05',
                        	total: 5223.2,
                        	pickupLocation: 'Sears 1'
                         },
                        {
                        	id: 31322,
                        	date: '2014-05-01',
                        	total: 244,
                        	pickupLocation: 'Giant store'
                         },
                         {
                         	id: 3333,
                         	date: '2014-08-22',
                         	total: 3400.02,
                         	pickupLocation: 'Sears 1'
                          }
                        ];
          deferred.resolve(items);
          /*
           $http.get(URLS.BASE_URL + 'orders/')
              .success(function(data, status, headers, config) {
                   var items = []; 
                  data.collection.items.forEach(function(itemData) {
                      var item = new OrderItem(itemData);
                      items.push(item);
                  });
                  deferred.resolve(items);
              })
              .error(function(data, status, headers, config) {
                  deferred.reject();
              });*/
          return deferred.promise;
      }
      
    }
    return ordersService;
  }
]);