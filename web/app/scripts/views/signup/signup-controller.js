(function() {
    'use strict';

    /**
     * @ngInject
     */
    function SignupController ($scope, $state, $stateParams, $translate, $window,
                             AuthService ) {
        $scope.alerts = [];
        $scope.addAlert = function(alertObject) {
            $scope.alerts.push(alertObject);
        };
        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };

        $scope.create = function() {
            $scope.alerts = [];
            if(!$scope.auth){
                handleError({
                    'status':''
                });
            }
            /*if($scope.auth.password!==$scope.auth.passwordConfirm){
                handleError({
                    'status':'As senhas não coincidem'
                });
                return;
            }*/
            $scope.created = AuthService.create($scope.auth).then(function(result){
                switch(result.status){
                    case 400:
                        $scope.addAlert({
                            type: 'danger',
                            msg: result.error
                        });
                        break;
                    case 201:
                    case 200:
                        AuthService.reset($scope.auth).then(function(){
                            $scope.alerts.push({
                                type: 'danger',
                                msg: $translate.instant('LOGIN.PASSWORD_RESET_LINK_SENT')
                            });
                        });
                }
            });
        };

        var handleError = function(result) {
            $scope.auth.failure = true;
            var msg = result.error ||
                    result.status + ': ' + $translate.instant('ERRORS.UNKNOWN_ERROR') + '.';
            $scope.addAlert({
                type: 'danger',
                msg: msg
            });
        };

    }
    angular.module('driver.views.signup').controller('SignupController', SignupController);
})();
