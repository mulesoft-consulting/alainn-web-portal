'use strict';

/* Items */

services.factory('Sku', ['$http', function($http) {
    function Sku(itemData) {
        if (itemData) {
            this.setData(itemData);
        }
        // Some other initializations related to item
    };
    Sku.prototype = {
        setData: function(itemData) {
            angular.extend(this, itemData);
        },

        images: function(){
            var urls = _.where( this.links, { "rel": "LargeImage"} );
            return urls;
        },

        firstImage: function(){
            var image = _.findWhere( this.links, { "rel": "LargeImage" } );
            return image === undefined ? "" : image;
        }
    };
    return Sku;
}]);



services.factory('Item', ['$http', '$q', 'Sku', function($http, $q, Sku) {
    function Item(itemData) {

        if (itemData) {
            this.setData(itemData);
        }
        // Some other initializations related to item
    };
    Item.prototype = {
        _skus: {}, 


        setData: function(itemData) {
            angular.extend(this, itemData);
        },
        
        getThumbUrl: function(){
            var image = _.findWhere( this.links, { "rel": "SmallImage" } );
            return image === undefined ? "" : image.href;
        },

        getFirstSku: function(){
            return this.getSkus()[0];
        },

        getMainImageUrl: function(){
            var sku = this.getFirstSku();
            var image = _.findWhere( sku.links, { "rel": "LargeImage" } );
            return image === undefined ? "" : image.href;
        },

        getImagesUrl: function(size){
          var urls = _.where( this.links, { "rel": size} );
          return urls; 
        },

        getSkus: function(){
            if ( _.size(this._skus)>0 )
                return this._skus;
            var s = [];
            this.skus.items.forEach(function(itemData) {
                s.push(new Sku(itemData));
            });
            this._skus = s;
            return this._skus;
        }
    };
    return Item;
}]);

services.service('brandsManager', [ '$http', '$q', 'URLS', function($http, $q, URLS) {
	var brandsManager = {
        findAll: function() {
            var deferred = $q.defer();
            var scope = this;
	            	
            var params = { pageSize: 500 };

            $http( {
                url: URLS.OPEN_URL + 'brands/', 
                method: 'GET',
                params: params 
                } )
                
            .success(function(itemsArray) {
                var items = [];
                itemsArray.collection.items.forEach(function(itemData) {
                	items.push(itemData);
                });
                deferred.resolve(items);
            })
            .error(function(error,b,c,d) {
                deferred.reject();
            });

            return deferred.promise;
        }
	};
	return brandsManager;
}]);

services.service('itemsManager', ['$http', '$q', 'Item', 'URLS', function($http, $q, Item, URLS) {
    var itemsManager = {
        _pool: {},
        _retrieveInstance: function(itemId, itemData) {
            var instance = this._pool[itemId];

            if (instance) {
                instance.setData(itemData);
            } else {
                instance = new Item(itemData);
                this._pool[itemId] = instance;
            }

            return instance;
        },
        _search: function(itemId) {
            return this._pool[itemId];
        },
        _load: function(itemId, deferred) {
            var scope = this;

            var params = { imageType: 'LargeImage, MediumImage' };

            $http( {
                url: URLS.OPEN_URL + 'items/' + itemId, 
                method: 'GET',
                params: params 
                } )
                .success(function(itemData) {
                    var item = scope._retrieveInstance(itemData.id, itemData);
                    deferred.resolve(item);
                })
                .error(function() {
                    deferred.reject();
                });
        },
        /* Public Methods */
        /* Use this function in order to get an item instance by it's id */
        getItem: function(itemId) {
            var deferred = $q.defer();
            var item = this._search(itemId);
            //if (item) {
            //    deferred.resolve(item);
            //} else {
                this._load(itemId, deferred);
            //}
            return deferred.promise;
        },
        loadItems: function(pageSize, pageIndex, query, brand) {
            var deferred = $q.defer();
            var scope = this;
            scope._pool = {};
            
            if ( pageSize === undefined )
            	pageSize = 10;
            if ( pageIndex === undefined )
            	pageIndex = 0;
            
            
            var params = { pageSize: pageSize, pageIndex: pageIndex };
            if ( !(query === undefined) )
            	params['name'] = query ;
            if ( !(brand === undefined) )
            	params['brand'] = brand ;

            $http( {
                url: URLS.OPEN_URL + 'items/?'+$.param(params), 
                method: 'GET' 
                } )
                
                .success(function(itemsArray) {
                    var items = [];
                    itemsArray.collection.items.forEach(function(itemData) {
                        var item = scope._retrieveInstance(itemData.id, itemData);
                        items.push(item);
                    });
                    var links = [];
                    itemsArray.links.forEach(function(link){
                    	links.push(link);
                    });

                    deferred.resolve({items:items,links:links});
                })
                .error(function() {
                    deferred.reject();
                });
            return deferred.promise;
        },
        loadItemsByUrl: function(url) {
            var deferred = $q.defer();
            var scope = this;
            scope._pool = {};
            
            var params = {  };

            $http( {
                url: url, 
                method: 'GET',
                params: params 
                } )
                
                .success(function(itemsArray) {
                    var items = [];
                    itemsArray.collection.items.forEach(function(itemData) {
                        var item = scope._retrieveInstance(itemData.id, itemData);
                        items.push(item);
                    });
                    var links = [];
                    itemsArray.links.forEach(function(link){
                    	links.push(link);
                    });

                    deferred.resolve({items:items,links:links});
                })
                .error(function() {
                    deferred.reject();
                });
            return deferred.promise;
        },
        
        setItem: function(itemData) {
            var scope = this;
            var item = this._search(itemData.id);
            if (item) {
                item.setData(itemData);
            } else {
                item = scope._retrieveInstance(itemData);
            }
            return item;
        },

    };
    return itemsManager;
}]);


