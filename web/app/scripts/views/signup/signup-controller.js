(function() {
    'use strict';

    /**
     * @ngInject
     */
    function SignupController ($scope, $state, $stateParams, $translate, $window, AuthService ) {
        $scope.pending = false;
        $scope.alerts = [];
        $scope.addAlert = function(alertObject) {
            $scope.alerts.push(alertObject);
        };
        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };

        $scope.create = function() {
            if($scope.pending){
                return;
            }
            $scope.pending = true;
            $scope.alerts = [];
            if(!$scope.auth){
                handleError({
                    'status':''
                });
            }
            /*jshint camelcase: false */
            $scope.auth.captcha_0 = $scope.captchaCode;
            /*jshint camelcase: true */
            $scope.created = AuthService.create($scope.auth).then(function(result){
                switch(result.status){
                    case 400:
                        $scope.addAlert({
                            type: 'danger',
                            msg: result.error
                        });
                        resetCaptcha();
                        $scope.pending = false;

                        break;
                    case 201:
                    case 200:
                        AuthService.reset($scope.auth).then(function(){
                            $scope.alerts.push({
                                type: 'danger',
                                msg: $translate.instant('LOGIN.PASSWORD_RESET_LINK_SENT')
                            });
                            resetCaptcha();
                            $scope.pending = false;
                        });
                }
            });
        };

        var handleError = function(result) {
            $scope.pending = false;
            if(!$scope.auth){
                $scope.auth = {};
            }
            $scope.auth.failure = true;
            var msg;
            if(!result.error){
                msg = result.status + ': ' + $translate.instant('ERRORS.UNKNOWN_ERROR') + '.';
            }else{
                msg = $translate.instant(result.error);
            }

            $scope.addAlert({
                type: 'danger',
                msg: msg
            });
        };
        var resetCaptcha = function(){
            AuthService.captcha().then(function(k){
                $scope.captchaSrc = k.captchaUrl;
                $scope.captchaCode = k.value;
                if($scope.auth){
                    /*jshint camelcase: false */
                    $scope.auth.captcha_1 = '';
                    /*jshint camelcase: true */
                }
            });
        };
        resetCaptcha();
    }
    angular.module('driver.views.signup').controller('SignupController', SignupController);
})();
