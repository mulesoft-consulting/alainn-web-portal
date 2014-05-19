
var ModalLoginController = function ($scope, $rootScope, $modal, $modalInstance, $interval, AuthService, AUTH_EVENTS) {

	$scope.credentials = { username: '', password: '' };
	$scope.message = "";
	
	$scope.onChange = function(){
		this.clearAlerts();
	}
	
	
	$scope.alerts = [
	                /*
	 { type: 'danger', msg: 'Oh snap! Change a few things up and try submitting again.' },
	 { type: 'success', msg: 'Well done! You successfully read this important alert message.' }
	 */
	];
	
	$scope.clearAlerts = function(){
		$scope.alerts = [];
	}
	
	$scope.closeAlert = function(index) {
	    $scope.alerts.splice(index, 1);
	  };
	               
	$scope.ok = function () {
		$scope.alerts.push({msg: 'Authenticating..'});
		
		if ( AuthService.login($scope.credentials) ){
			$scope.alerts.push({type: 'success', msg: 'Welcome!'});
			$modalInstance.close($scope.credentials);
		    $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
		    
		} else{
			this.clearAlerts();
			$scope.alerts.push({type: 'danger', msg: 'Invalid credentials'});
			$interval($scope.clearAlerts, 2200, 0);
			$rootScope.$broadcast(AUTH_EVENTS.loginFailed);
		};
	};

	$scope.cancel = function () {
	    $modalInstance.dismiss('cancel');
	};
	
	$scope.register = function (size) {
	    var modalInstance = $modal.open({
	      templateUrl: 'modal.registration.html',
	      controller: ModalRegistrationController,
	      size: size
	      /*,
	      resolve: {
	        items: function () {
	          return $scope.items;
	        }
	      }*/
	    });

	    modalInstance.result.then(function (registration) {
	    	alert('reg:'+JSON.stringify(registration));
	    	$scope.credentials.username = registration.username;
	    	$scope.credentials.password = registration.password;
	    }, function () {
	    	//$log.info('Modal dismissed at: ' + new Date());
	    });
	};
};



var ModalRegistrationController = function ($scope, $rootScope, $modalInstance, $interval, AuthService, AUTH_EVENTS) {

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
	
	$scope.alerts = [
	                /*
	 { type: 'danger', msg: 'Oh snap! Change a few things up and try submitting again.' },
	 { type: 'success', msg: 'Well done! You successfully read this important alert message.' }
	 */
	];
	
	$scope.clearAlerts = function(){
		$scope.alerts = [];
	}
	
	$scope.closeAlert = function(index) {
	    $scope.alerts.splice(index, 1);
	  };
	               
	$scope.ok = function () {
		$scope.alerts.push({msg: 'Registering..'});
		
		if ( AuthService.register($scope.registration) ){
			$scope.alerts.push({type: 'success', msg: 'Welcome!'});
			$modalInstance.close($scope.registration);
		    $rootScope.$broadcast(AUTH_EVENTS.registrationSuccess);
		} else{
			this.clearAlerts();
			$scope.alerts.push({type: 'danger', msg: 'Invalid credentials'});
			$interval($scope.clearAlerts, 2200, 0);
			$rootScope.$broadcast(AUTH_EVENTS.registrationFailed);
		};
	};

	$scope.cancel = function () {
	    $modalInstance.dismiss('cancel');
	};
};