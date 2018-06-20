(function() {
    'use strict';

    /**
     * @ngInject
     */
    function ResetController ($scope, $state, $stateParams, $translate, $window, $cookies, AuthService ) {
        $scope.reset = function() {
            $scope.alerts = [];
            if(!$scope.auth){
                handleError({
                    'status':''
                });
            }
            $scope.auth.csrfmiddlewaretoken = $cookies.get('csrftoken');
            $scope.sent = AuthService.reset($scope.auth).then(function(result){
                $scope.alerts.push({
                    type: 'danger',
                    msg: $translate.instant('LOGIN.PASSWORD_RESET_LINK_SENT')
                });
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
    angular.module('driver.views.reset').controller('ResetController', ResetController);
})();
