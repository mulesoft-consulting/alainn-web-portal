'use strict';

services.factory('Session', [  function () {
	var session = {
		create: function (username) {
		    this.username = username;
		    sessionStorage.setItem( 'user', username );
		    //return sessionStorage.setItem(key,value);
		    return true;
		},
		get:function(){
			return sessionStorage.getItem('user');
		},
		destroy: function () {
		    this.username = null;
		    sessionStorage.removeItem('user');
		    //return sessionStorage.removeItem(key);
		    return true;
		},
		isActive: function (){
			var item  = this.get();
			return !(item === undefined || !item)
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
	    	/*
		    return $http( { method: 'HEAD', url: URLS.BASE_URL+'registrations/' + credentials.username })
		        .success(function(a,b,c,d){
		        	alert('auth ok');
		        }).error(function(a,b,c,d){
		        	alert('error');
		        });
	    	*/
	    	/*
		     return $http
	        .post('/login', credentials)
	        .then(function (res) {
	          Session.create(res.id, res.userid, res.role);
	        });
	    	
	    	var token = {
	    	    "expires_in": 86400,
	    	    "token_type": "bearer",
	    	    "refresh_token": "h5hzcBzmLY-RdWhODy_F3z4-QlCO7r3tjGSRI4EASxFjJnmmqnvS8pSNb0ykw06eyU2gfRL7a_lBHU2ihnFLog",
	    	    "access_token": "YO9AJsnwZw8qSprtcd9WwAMGjxhRIMwEG4iI1efBaeRrmLhGd77VjAgz5-WIdPrjJFlUYdhudCHllHVjxTbiwQ"
	    	}*/
	    	/*
	    	if ( credentials.username != 'mjuan')
	    		return false;*/
//			var drTokenParams = $.param({
//		        grant_type : 'password',
//		        username : scope.username,
//		        password : scope.password,
//		        client_id : 'web-ui',
//		        scope : 'READ%20WRITE'
//		      });

//	      return $http
//	        .post('/login', credentials)
//	        .then(function (res) {
//	          Session.create(res.id, res.userid, res.role);
//	        });
	    	return Session.create(credentials.username);
	    },
	    logout: function(){
	    	return Session.destroy();
	    },
	    isAuthenticated: function () {
	      return !(Session===undefined) && Session.isActive();
	    }
	  }
	}]);
