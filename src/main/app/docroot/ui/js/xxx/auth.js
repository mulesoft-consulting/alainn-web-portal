'use strict';

services.factory('Session', [  function (sessionService) {
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
				  regRequest.notificationPreferences.push("apple-push");
			  
			  var deferred = $q.defer();
			  
			  $http( { url: URLS.REG_URL+'registrations/'+registration.username, method: 'HEAD' } )
		        .success(function(data, status, headers, config) {
		        	//user exists
		        	//throw message
		        	  regResult.succesful = false;
		        	  regResult.message = 'User already exists';
		        	  
		        	  deferred.resolve(regResult);
		        	  
		          }).
		          error(function(data, status, headers, config) {
		        	  //user does not exist
		        	  
		        	  $http( { url: URLS.REG_URL+'registrations/'+registration.username, method: 'PUT', data: regRequest, headers: headers } )
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
		  
		  
	    logout: function(){
	    	return Session.destroy();
	    },
	    isAuthenticated: function () {
	      return !(Session===undefined) && Session.isActive();
	    }
	  }
	}]);
