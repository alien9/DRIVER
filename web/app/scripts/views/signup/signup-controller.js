(function() {
    'use strict';

    /**
     * @ngInject
     */
    function SignupController ($scope, $state, $stateParams, $translate, $window,
                             AuthService, SSOClients, WebConfig) {
        $scope.alerts = [];
        $scope.addAlert = function(alertObject) {
            $scope.alerts.push(alertObject);
        };
        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };

        $scope.create = function() {
            $scope.alerts = [];
            $scope.authenticated = AuthService.create($scope.auth);
            $scope.authenticated.then(function(result) {
                if (result.isAuthenticated) {
                    // Since there's no state that's the parent of all other states, there's no way
                    // to get $state to actually reload everything. And since various controllers
                    // check (or assume) authentication on init and don't watch or listen for
                    // changes, we need to do a full reload on login.
                    // If there's no 'next' page, we can do that by setting location to '/', but
                    // if we're redirecting to a target state, we need to use $state.go but reload
                    // after the state transition.
                    if ($stateParams.next && $stateParams.next.name !== $state.name &&
                            !_.contains(['/', '/signup'], $stateParams.next.url)) {
                        return $state.go($stateParams.next.name, $stateParams.nextParams)
                            .then(function () { $window.location.reload(); });
                    } else {
                        $window.location.href = '/';
                    }
                } else {
                    handleError(result);
                }
            }).catch(handleError);
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
