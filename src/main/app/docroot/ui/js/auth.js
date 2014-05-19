'use strict';

services.factory('Session', [  function () {
	var session = {
		create: function (username, token) {
		    this.username = username;
		    sessionStorage.setItem( 'user', username );
		    sessionStorage.setItem( 'token', token );
		    return true;
		},
		getUser:function(){
			return sessionStorage.getItem('user');
		},
		getToken:function(){
			return sessionStorage.getItem('token');
		},
		destroy: function () {
		    this.username = null;
		    sessionStorage.removeItem('user');
		    sessionStorage.removeItem('token');
		    return true;
		},
		isActive: function (){
			var token  = this.getToken();
			return !(token === undefined || !token)
		}
	};
	return session;
}]);


services.factory('AuthService', ['$http', '$q', 'Session', 'URLS', function ($http, $q, Session, URLS) {
	  return {
		  register: function (registration) {
			return true;  
		  },
		  
		  login: function (credentials) {
	    	var authResult = {
	    			succesful: true,
	    			message: ''
	    	};
	    	var deferred = $q.defer();
	    	
        	var auth = {
  				   "grant_type": 'password',
 				   "username": credentials.username,
 				   "password": credentials.password,
 				   "client_id": '529533f8e4b02c949895e3d2',
 				   "client_secret": '5325d57bbbaa0655d1447dbd'
	 		   }
		 		   
	        	var headers = {
        			//Accept: '*/*'
	               // "Content-Type" : 'application/x-www-form-urlencoded;UTF-8;'
        			'Content-Type': 'application/x-www-form-urlencoded'
        			//'Content-Type': 'application/json'
	            };

	        	var token = {
	    	    	    "expires_in": 86400,
	    	    	    "token_type": "bearer",
	    	    	    "refresh_token": "h5hzcBzmLY-RdWhODy_F3z4-QlCO7r3tjGSRI4EASxFjJnmmqnvS8pSNb0ykw06eyU2gfRL7a_lBHU2ihnFLog",
	    	    	    "access_token": "IC5DINFBYhJkr9dWS-otPfaMFdxE03CPMWTYdUe-xttfxnv5I9ns9jq41mObrbugvpEjDPww6gInuXgG02A1QQ"
	    	    	}
	        	
	        	$http( { url:URLS.ACCESS_TOKEN , method: 'POST', params: auth, headers: headers } )
		        .success(function(data, status, headers, config) {
		    Session.create(credentials.username, token.access_token);
		 			 deferred.resolve(authResult);
		          }).
		          error(function(data, status, headers, config) {
		    Session.create(credentials.username, token.access_token);  
		    authResult.succesful = true;
		        	authResult.message = 'Invalid credentials :'+JSON.stringify(config);
		 			 deferred.resolve(authResult);
		          });
	        	/*
		        $http( {
		        	url: URLS.ACCESS_TOKEN, 
		        	data: $.param(auth),
		        	method: "GET" ,
		        	headers: headers
		        }).
		        success(function(data, status, headers, config) {
		    Session.create(credentials.username, token.access_token);
		 			 deferred.resolve(authResult);
		          }).
		          error(function(data, status, headers, config) {
		    Session.create(credentials.username, token.access_token);  
		    authResult.succesful = true;
		        	authResult.message = 'Invalid credentials :'+JSON.stringify(config);
		 			 deferred.resolve(authResult);
		          });*/
		   
		   return deferred.promise;
	    },
	    logout: function(){
	    	return Session.destroy();
	    },
	    isAuthenticated: function () {
	      return !(Session===undefined) && Session.isActive();
	    }
	  }
	}]);
