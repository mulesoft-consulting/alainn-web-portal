(function () {
'use strict';

	var app = angular.module('alainn');
	  app.factory('sessionService', function() {
		var session = {
				create: function (token) {
				    sessionStorage.setItem( 'token', token );
				    return true;
				},
				getUser:function(){
					return sessionStorage.getItem('user');
				},
				setUser: function(user) {
					sessionStorage.setItem('user', username );
				},
				getToken:function(){
					return sessionStorage.getItem('token');
				},
				destroy: function () {
				    this.username = null;
				    sessionStorage.removeItem('user');
				    sessionStorage.removeItem('token');
				},
				isActive: function (){
					var token  = this.getToken();
					return !(token === undefined || !token)
				}
			};
			return session;
		});

	  
})();