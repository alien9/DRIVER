(function () {
    'use strict';

    /* ngInject */
    function Pop() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/pop/pop-partial.html',
            controller: 'PopController',
            controllerAs: 'modal',
            bindToController: true
        };
        return module;
    }

    angular.module('driver.pop')
    .directive('driverPop', Pop);

})();
