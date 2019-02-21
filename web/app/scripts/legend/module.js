(function () {
    'use strict';

    /* ngInject */
    function LegendConfig() {
    }

    angular.module('driver.legend', [
        'ase.auth',
        'debounce',
        'driver.resources',
        'driver.state',
        'driver.localization',
        'ui.bootstrap'
    ]).config(LegendConfig);

})();
