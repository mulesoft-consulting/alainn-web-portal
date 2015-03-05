(function () {
'use strict';

	var app = angular.module('alainn');


	app.controller('loginController', function ($scope, $modal, $log, authenticationService, $stateParams) {

		$scope.alerts = [];
		
		if ($stateParams.error) {
			$scope.alerts.push({type: 'danger', msg: 'Sorry, but you must be signed in to see our Products!' });
		}
		
		$scope.closeAlert = function(index) {
			  $scope.alerts.splice(index, 1);
	      };

		  
		  $scope.register = function () {

		    var modalInstance = $modal.open({
		      templateUrl: 'myModalContent.html',
		      controller: 'registrationController'
		    });

		    modalInstance.result.then(function () {
		      // success, because modal was closed by successful response block
		      authenticationService.requestCode();
		    }, function () {
		      $log.info('Modal dismissed at: ' + new Date());
		    });
		    
		    
		  };
		  
		  
		    
		  $scope.signIn = function() {
			authenticationService.requestCode();
		  }

		});
	
		
		// Please note that $modalInstance represents a modal window (instance) dependency.
		// It is not the same as the $modal service used above.

		app.controller('registrationController', function ($scope, $modalInstance, registrationService, authenticationService, $timeout) {

		  $scope.alerts = [];
		  
		  $scope.registration = { 
				username: '', 
				password: '', 
				password2: '',
				userdata: {
			        "firstName" : "",
			        "lastName" : "",
			        "mobileNumber" : "",
			        "notificationPreferences": {
			           sms: false,
			           email: true,
			           web: false,
			           applePush: false
			        }
				}
			};
			
			$scope.onChange = function(){
				this.clearAlerts();
			}

		  $scope.clearAlerts = function(){
			  $scope.alerts = [];
		  }
			
		  $scope.closeAlert = function(index) {
			  $scope.alerts.splice(index, 1);
	      };


		  $scope.ok = function () {
			this.clearAlerts();
			$scope.alerts.push({msg: 'Registering..'});
			registrationService.register($scope.registration).then(function(regResults){
				$scope.clearAlerts();
				if ( regResults.succesful ){
					$scope.alerts.push({type: 'success', msg: 'Welcome ' + $scope.registration.userdata.firstName + '. Go ahead and sign in!' });
					$timeout(function() {
						$modalInstance.close();
						authenticationService.requestCode();
					}, 2000);
					
				}else{
					$scope.alerts.push({type: 'danger', msg: regResults.message });
				}	
			});
			
		  };

		  $scope.cancel = function () {
		    $modalInstance.dismiss('cancel');
		  };
		});

})();
