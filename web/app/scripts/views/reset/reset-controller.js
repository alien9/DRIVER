(function() {
    'use strict';

    /**
     * @ngInject
     */
    function ResetController ($scope, $cookies, $state, $stateParams, $translate, $window, AuthService ) {
        $scope.pending = false;
        $scope.reset = function() {
            if($scope.pending){
                return;
            }
            $scope.pending = true;
            $scope.alerts = [];
            $scope.addAlert = function(alertObject) {
                $scope.alerts.push(alertObject);
            };
            $scope.closeAlert = function(index) {
                $scope.alerts.splice(index, 1);
            };

            if(!$scope.auth){
                handleError({
                    'status':'',
                    'error': $translate.instant('LOGIN.EMAIL_NOT_VALID')
                });
            }else{
                $scope.auth.csrfmiddlewaretoken = $cookies.get('csrftoken');
                $scope.sent = AuthService.reset($scope.auth).then(function(){
                    $scope.pending = false;
                    $scope.alerts.push({
                        type: 'danger',
                        msg: $translate.instant('LOGIN.PASSWORD_RESET_LINK_SENT')
                    });
                });
            }
        };

        var handleError = function(result) {
            $scope.pending = false;
            var msg = result.error ||
                    result.status + ': ' + $translate.instant('ERRORS.UNKNOWN_ERROR') + '.';
            $scope.addAlert({
                type: 'danger',
                msg: msg
            });
        };
    }
    angular.module('driver.views.reset').controller('ResetController', ResetController);
})();
