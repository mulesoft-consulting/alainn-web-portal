(function () {
'use strict';

	var app = angular.module('alainn');
	app.service('userService', function($http, URLS, $q) {
		return {
			getUser : function() {
				var deferred = $q.defer();
		        $http.get(URLS.BASE_URL + 'my-profile')
					.success(function(data) {
						deferred.resolve(data.firstName + ' ' + data.lastName);
					});
				return deferred.promise;
			}
		}
	});

	  
})();