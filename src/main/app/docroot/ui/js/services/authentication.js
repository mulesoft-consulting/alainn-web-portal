(function () {
'use strict';

	var app = angular.module('alainn');

	  app.service('authenticationService', function authenticationService($modal, $http, $location, $window, sessionService) {
		  var self = this;
		
		  self.encodeState = function(state) {
		    return $window.btoa(JSON.stringify(state));
		  }
		
		  self.decodeState = function(state) {
		    return JSON.parse($window.atob(state));
		  }
		  
	  
		  self.requestCode = function(state) {
		      
		      var signinUri = 'https://ec2-54-69-90-236.us-west-2.compute.amazonaws.com:9031/as/authorization.oauth2';
		      var query     = {
		        'response_type': 'code',
		        'client_id':     '7854f978a8f64fb6b18ce198a10f3b8c',
		        'state':         self.encodeState(state || {}),
		        'redirect_uri' : 'https://alainn-web-portal.cloudhub.io/auth'//'https://localhost:8082/auth'//
		      };
		
		      var url = signinUri + '?' + Object.keys(query).map(function (key) {
		        return key + '=' + encodeURIComponent(query[key]);
		      }).join('&');
		
		      // Make the browser request url
		      $window.location = url;
		  };
		
		  self.isAuthenticated = function isAuthenticated() {
		    return sessionService.getUser();
		  };
		  
		  self.logout = function(){
		    	sessionService.destroy();
		    },
		    
		  self.isAuthenticated = function () {
		      return !(sessionService===undefined) && sessionService.isActive();
		    }
		
		  return self;
		});
	  
	  	

})();
