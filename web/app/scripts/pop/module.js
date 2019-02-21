(function () {
    'use strict';

    /* ngInject */
    function DirectiveConfig() {
    }

    angular.module('driver.pop', [
        'ase.auth',
        'debounce',
        'driver.resources',
        'driver.state',
        'driver.localization',
        'ui.bootstrap'
    ]).config(DirectiveConfig);

})();
