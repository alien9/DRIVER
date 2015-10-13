(function () {
    'use strict';

    /* ngInject */
    function DefaultRoutingConfig($locationProvider, $urlRouterProvider, WebConfig) {
        $locationProvider.html5Mode(WebConfig.html5Mode.enabled);
        $locationProvider.hashPrefix(WebConfig.html5Mode.prefix);

        $urlRouterProvider.otherwise('/');
    }

    /* ngInject */
    function LogConfig($logProvider, WebConfig) {
        $logProvider.debugEnabled(WebConfig.debug);
    }

    /* ngInject */
    function LeafletDefaultsConfig(LeafletDefaultsProvider) {
        LeafletDefaultsProvider.setDefaults({
            center: [12.375, 121.5], // geographic center of Philippines
            zoom: 5,
            crs: L.CRS.EPSG3857
        });
    }

    /* ngInject */
    function LocalStorageConfig(localStorageServiceProvider) {
        localStorageServiceProvider.setPrefix('DRIVER.web')
                                   .setStorageType('sessionStorage');
    }

    /* ngInject */
    function HttpConfig($httpProvider) {
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    }

    /**
     * @ngdoc overview
     * @name driver
     * @description
     * # driver: Data for Road Incident Visualization, Evaluation, and Reporting
     *
     * Main module of the application.
     */
    angular.module('driver', [
        'Leaflet',
        'driver.config',
        'driver.navbar',
        'driver.filterbar',
        'driver.toddow',
        'driver.state',
        'driver.stepwise',
        'driver.views.account',
        'driver.views.dashboard',
        'driver.views.map',
        'driver.views.record',
        'ui.router',
        'LocalStorageModule'
    ])
    .config(DefaultRoutingConfig)
    .config(LogConfig)
    .config(LeafletDefaultsConfig)
    .config(LocalStorageConfig)
    .config(HttpConfig);
})();