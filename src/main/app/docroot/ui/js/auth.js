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
			  var regResult = {
		    			succesful: true,
		    			message: ''
		    	}; 
			  var headers = {
	        			'Content-Type': 'application/json'
		            };
			  var regRequest = {
					    "firstName": registration.userdata.firstName,
					    "lastName": registration.userdata.lastName,
					    "mobileNumber": registration.userdata.mobileNumber,
					    "password" : registration.password,
					  	"notificationPreferences": [  ]
					};
			  if ( registration.userdata.notificationPreferences.sms)
				  regRequest.notificationPreferences.push("sms");
			  if ( registration.userdata.notificationPreferences.email)
				  regRequest.notificationPreferences.push("email");
			  if ( registration.userdata.notificationPreferences.web)
				  regRequest.notificationPreferences.push("web");
			  if ( registration.userdata.notificationPreferences.applePush)
				  regRequest.notificationPreferences.push("mobile-push");
			  
			  var deferred = $q.defer();
			  
			  $http( { url: URLS.OPEN_URL+'registrations/'+registration.username, method: 'HEAD' } )
		        .success(function(data, status, headers, config) {
		        	//user exists
		        	//throw message
		        	  regResult.succesful = false;
		        	  regResult.message = 'User already exists';
		        	  
		        	  deferred.resolve(regResult);
		        	  
		          }).
		          error(function(data, status, headers, config) {
		        	  //user does not exist
		        	  
		        	  $http( { url: URLS.OPEN_URL+'registrations/'+registration.username, method: 'POST', data: regRequest, headers: headers } )
				        .success(function(data, status, headers, config) {
				        	//Session.create(credentials.username, data.access_token);
				 			 deferred.resolve(regResult);
				          }).
				          error(function(data, status, headers, config) {
				        	  regResult.succesful = false;
				        	  regResult.message = 'Error:'+JSON.stringify(data);
				        	  //regResult.message = 'Invalid credentials';
				 			 deferred.resolve(regResult);
				          });
					  
		          });
			  return deferred.promise;
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
        			"Accept": '*/*' ,
	                "Content-Type" : 'application/x-www-form-urlencoded'
        			//'Content-Type': 'application/x-www-form-urlencoded'
        			//'Content-Type': 'application/json'
	            };

        		/*
	        	var token = {
	    	    	    "expires_in": 86400,
	    	    	    "token_type": "bearer",
	    	    	    "refresh_token": "h5hzcBzmLY-RdWhODy_F3z4-QlCO7r3tjGSRI4EASxFjJnmmqnvS8pSNb0ykw06eyU2gfRL7a_lBHU2ihnFLog",
	    	    	    "access_token": "IC5DINFBYhJkr9dWS-otPfaMFdxE03CPMWTYdUe-xttfxnv5I9ns9jq41mObrbugvpEjDPww6gInuXgG02A1QQ"
	    	    	}
	    	    	*/
	        	
	        	$http( { url: URLS.ACCESS_TOKEN, method: 'POST', data: $.param(auth), headers: headers } )
		        .success(function(data, status, headers, config) {
		        	Session.create(credentials.username, data.access_token);
		 			 deferred.resolve(authResult);
		          }).
		          error(function(data, status, headers, config) {
		        	  authResult.succesful = false;
		        	  //authResult.message = 'Error:'+data.error_message;
		        	 authResult.message = 'Invalid credentials';
		 			 deferred.resolve(authResult);
		          });
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
