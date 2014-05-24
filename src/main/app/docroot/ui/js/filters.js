'use strict';

/* Filters */

var filters = angular.module('filters', []);

filters.filter( 'https', function(_) {
	  return function(url) {
//		  if (url === undefined)
//			  return url;
//		  url = url.replace( 'http:', 'https:');
		  return url;
	  };
	});

filters.filter( 'localhost', function(_) {
	  return function(item) {
		  if (item === undefined)
			  return item;
		  return item.replace( 'localhost:8082', 'alainn-api.cloudhub.io');
	  };
	});

filters.filter( 'positionInList' , function(_) {
	return function(item, list) {
	    return list.indexOf(item);
	  }
});

filters.filter( 'dataValue', function(_) {
  return function(item, key) {
    return _.findWhere(list, { "name": key } ).value;
  };
});

filters.filter( 'linksByRel', function(_) {
  return function( item, rel ) {
    return _.where( item.links, { "rel": rel } );
  };
});

filters.filter( 'firstLinkByRel', function(_) {
  return function( item, rel ) {
    return _.findWhere( item.links, { "rel": rel } );
  };
});

filters.filter( 'thumb', function(_) {
  return function( item ) {
  	var thumbLink = _.findWhere( item.links, { "rel": "SmallImage" } );
    return thumbLink.href;
  };
});

filters.filter( 'images', function(_) {
  return function( element ) {
  	return _.where( element.links, { "rel": "LargeImage" } );
  };
});


filters.filter( 'href', function(_) {
  return function( link ) {
  	return link === undefined ? "": link.href;
  };
});


filters.filter( 'hasLinks', function() {
  return function(item) {
  	return (item.links != null && item.links.length > 0) ? '\u2749' : '';
  };
});

