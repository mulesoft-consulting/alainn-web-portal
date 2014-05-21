'use strict';

/* Services */

 angular.module('underscore', []).factory('_', function() {
    return window._; // assumes underscore has already been loaded on the page
  });  



var services = angular.module('services', ['ngResource'] );


services.service('navigation', function(){
	var navigation = {
		_links: { } ,
		_last: '',
		setLinks: function(links){
			this._links = links;
		},
		last: function(url){
			var scope = this;
			scope._last = url;
		},
		next: function(){
			var scope = this;
			return _.findWhere( scope._links, { 'rel': 'next' } );
		},
		prev: function(){
			var scope = this;
			return _.findWhere( scope._links, { 'rel': 'prev' } );
		},
		hasNext: function(){
			return !(this.next() === undefined);
		},
		hasPrev: function(){
			return !(this.prev() === undefined);
		},
		hasLinks: function(){
			return _.size(this._links);
		},
		pageIndex: function(){
			if (this._last!=''){
				return this.getParameterByName(this._last, 'pageIndex');
			}else if (this.hasNext()) {
				var index = this.getParameterByName(this.next().href, 'pageIndex');
				var size = this.getParameterByName(this.next().href, 'pageSize');
				return (parseInt(index) - parseInt(size));
			}else if (this.hasPrev()) {
				var index = this.getParameterByName(this.prev().href, 'pageIndex');
				var size = this.getParameterByName(this.prev().href, 'pageSize');
				return (parseInt(index) + parseInt(size));
			}else{
				return 0;
			}
		},
		pageSize: function(){
			if (this._last!=''){
				return this.getParameterByName(this._last, 'pageSize');
			}else if (this.hasNext()) {
				return this.getParameterByName(this.next().href, 'pageIndex');
			}else if (this.hasPrev()) {
				return this.getParameterByName(this.prev().href, 'pageIndex');
			}else {
				return 20;
			}
		},
		getParameterByName: function (url, name) {
		    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		        results = regex.exec(url);
		    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
		}
	};
	return navigation;
});