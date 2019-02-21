(function () {
    'use strict';

    /* ngInject */
    function DriverLegend() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/legend/legend-partial.html',
            controller: 'LegendController',
            controllerAs: 'ctl',
            bindToController: true
        };
        return module;
    }

    angular.module('driver.legend').directive('driverLegend', DriverLegend);

})();
