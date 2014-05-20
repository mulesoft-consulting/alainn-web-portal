
var ModalLoginController = function ($scope, $rootScope, $modal, $modalInstance, $interval, AuthService, AUTH_EVENTS) {

	$scope.credentials = { username: 'mjuan@mulesoft.com', password: 'xxx' };
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
		this.clearAlerts();
		$scope.alerts.push({msg: 'Authenticating..'});
		
		AuthService.login($scope.credentials).then(function(authResults){
			$scope.clearAlerts();
			if ( authResults.succesful ){
				$scope.alerts.push({type: 'success', msg: 'Welcome' });
				$modalInstance.close($scope.credentials);
			    $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
			}else{
				$scope.alerts.push({type: 'danger', msg: authResults.message });
				//$interval($scope.clearAlerts, 2200, 0);
				$rootScope.$broadcast(AUTH_EVENTS.loginFailed);
			}
				
		});
	};

	$scope.cancel = function () {
	    $modalInstance.dismiss('cancel');
	};
	
	$scope.register = function (size) {
	    var modalInstance = $modal.open({
	      templateUrl: 'modal.registration.html',
	      controller: ModalRegistrationController,
	      size: size
	    });

	    modalInstance.result.then(function (registration, result) {
	    	$scope.credentials.username = registration.username;
	    	$scope.credentials.password = registration.password;
	    	$scope.ok();
	    }, function () {
	    	//$log.info('Modal dismissed at: ' + new Date());
	    });
	};
};



var ModalRegistrationController = function ($scope, $rootScope, $modalInstance, $interval, AuthService, AUTH_EVENTS) {

	$scope.registration = { 
		username: 'mjuan@mulesoft.com', 
		password: 'xxxxx', 
		password2: '',
		userdata: {
	        "firstName" : "matias",
	        "lastName" : "juan",
	        "mobileNumber" : "+1 55 5555",
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
		
		this.clearAlerts();
		$scope.alerts.push({msg: 'Registering..'});
		AuthService.register($scope.registration).then(function(regResults){
			$scope.clearAlerts();
			if ( regResults.succesful ){
				$scope.alerts.push({type: 'success', msg: 'Welcome' });
				$modalInstance.close($scope.registration);
			    $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
			}else{
				$scope.alerts.push({type: 'danger', msg: regResults.message });
				//$interval($scope.clearAlerts, 2200, 0);
				$rootScope.$broadcast(AUTH_EVENTS.loginFailed);
			}
				
		});
	};

	$scope.cancel = function () {
	    $modalInstance.dismiss('cancel');
	};
};