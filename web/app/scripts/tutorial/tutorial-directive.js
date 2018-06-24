(function () {
    'use strict';

    /* ngInject */
    function Tutorial() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/tutorial/tutorial-partial.html',
            controller: 'TutorialController',
            controllerAs: 'ctl',
            bindToController: true
        };
        return module;
    }

    angular.module('driver.tutorial')
    .directive('driverTutorial', Tutorial);

})();
