(function () {
    'use strict';

    /* ngInject */
    function Interventions() {
        var module = {
            restrict: 'AE',
            templateUrl: 'scripts/tools/Requests/requests-partial.html',
            controller: 'RequestsController',
            controllerAs: 'ctl',
            bindToController: true,
            scope: {
                recordQueryParams: '=params'
            }
        };
        return module;

    }

    angular.module('driver.tools.requests')
    .directive('driverRequests', Requests);

})();
