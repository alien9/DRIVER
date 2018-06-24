(function () {
    'use strict';

    /* ngInject */
    function DirectiveConfig() {
    }

    angular.module('driver.tutorial', [
        'ase.auth',
        'debounce',
        'driver.resources',
        'driver.state',
        'driver.localization',
        'ui.bootstrap'
    ]).config(DirectiveConfig);

})();
