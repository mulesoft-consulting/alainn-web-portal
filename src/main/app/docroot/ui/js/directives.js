'use strict';

/* Directives */

app.directive('formAutofillFix', function ($timeout) {
  return function (scope, element, attrs) {
    element.prop('method', 'post');
    if (attrs.ngSubmit) {
      $timeout(function () {
        element
          .unbind('submit')
          .bind('submit', function (event) {
            event.preventDefault();
            element
              .find('input, textarea, select')
              .trigger('input')
              .trigger('change')
              .trigger('keydown');
            scope.$apply(attrs.ngSubmit);
          });
      });
    }
  };
});
/*
var ngShowDirective = ['$animate', function($animate) {
	  return function(scope, element, attr) {
	    scope.$watch(attr.ngShow, function ngShowWatchAction(value){
	      $animate[toBoolean(value) ? 'removeClass' : 'addClass'](element, 'ng-hide');
	    });
	  };
	}];
*/
app.directive('isActive', function($animate, $location) {
    return  function(scope, element, attrs) {
//        	if ( attrs.isActive=='true' ){
//                element.addClass('active');
//        	}
//        	scope.$watch(attrs.isActive, function ngShowWatchAction(value){
//        		$animate[value.indexOf(attrs.current)==0 ? 'addClass' : 'removeClass'](element, 'active');
//      	    });
//    		scope.$watch(attrs.isActive, function(value){
//    			alert(value);
//    		})
    		scope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    			$animate[toState.url.indexOf(attrs.current)==0 ? 'addClass' : 'removeClass'](element, 'active');
    		});
        
    };
});

