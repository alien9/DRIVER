/**
 * Constants control - meant to load constants from backend
 */
(function () {
    'use strict';

    /* ngInject */
    function ConstantsState(Constants, InitialState, WebConfig) {
        var svc = this;
        init();
        /**
         * initialization
         */
        function init() {
            Constants.get({}).$promise.then(function(cc) {
                WebConfig.constants = cc;
                InitialState.setConstantsInitialized(true);
            });
        }
        return svc;
    }

    angular.module('driver.state')
    .service('ConstantsState', ConstantsState);
})();
