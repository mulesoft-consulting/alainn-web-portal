(function () {
'use strict';

	var app = angular.module('alainn');

	app.factory('registrationService', ['$http', '$q', 'URLS', function ($http, $q, URLS) {
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
				  	// maybe because we return rejection in $http interceptor registered in app.js, we get a 'success' for 4xx and 2xx
				    // temporarily put conditional logic in the success handler for both scenarios.
			        .success(function(data, status, headers, config) {
			        	if (200 === status) {
				        	// user exists
				        	regResult.succesful = false;
				        	regResult.message = 'User already registered with that email';
				        	deferred.resolve(regResult);
			        	} else if (404 === status) {
			        		$http( { url: URLS.REG_URL+'registrations/'+registration.username, method: 'PUT', data: regRequest, headers: headers } )
						        .success(function(data, status, headers, config) {
						        	deferred.resolve(regResult);
						        })
						        .error(function(data, status, headers, config) {
						        	regResult.succesful = false;
						        	regResult.message = 'Error:'+JSON.stringify(data);
						 			deferred.resolve(regResult);
						        });
			        	}
			        })
//			        .error(function(data, status, headers, config) {
//		        	  //user does not exist
//		        	  $http( { url: URLS.REG_URL+'registrations/'+registration.username, method: 'PUT', data: regRequest, headers: headers } )
//				        .success(function(data, status, headers, config) {
//				        	deferred.resolve(regResult);
//				        })
//				        .error(function(data, status, headers, config) {
//				        	regResult.succesful = false;
//				        	regResult.message = 'Error:'+JSON.stringify(data);
//				 			deferred.resolve(regResult);
//				        });
//			          });
				  return deferred.promise;
			  }
		  }
		}]);
})();
