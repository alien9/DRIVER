(function () {
    'use strict';

    /* Service for sharing baselayer configuration.
     */

    /* ngInject */
    function BaseLayersService($translate) {

        var module = {
            streets: streets,
            osm: osm,
            satellite: satellite,
            baseLayers: baseLayers
        };
        return module;

        function streets() {
        //'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',

            var layer = new L.tileLayer(
                'https://vidasegura.prefeitura.sp.gov.br/geoserver/gwc/service/wmts?layer=driver%3ABase&style=&tilematrixset=EPSG%3A900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fpng&TileMatrix=EPSG%3A900913%3A{z}&TileCol={x}&TileRow={y}',
                {
                    attribution: $translate.instant('MAP.CDB_ATTRIBUTION'),
                    detectRetina: false,
                    zIndex: 1
                }
            );
            return layer;
        }

        function osm() {
            var layer = new L.tileLayer(
                'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
                {
                    attribution: $translate.instant('MAP.CDB_ATTRIBUTION'),
                    detectRetina: false,
                    zIndex: 1
                }
            );
            return layer;
        }

        function satellite() {
            var layer = new L.tileLayer(
                '//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                {
                    attribution: $translate.instant('MAP.ESRI_ATTRIBUTION'),
                    detectRetina: false,
                    zIndex: 1
                }            );
            return layer;
        }

        function baseLayers() {
            return [
                {
                    slugLabel: 'streets',
                    label: $translate.instant('MAP.STREETS_MDC'),
                    layer: streets()
                },
                {
                    slugLabel: 'osm',
                    label: $translate.instant('MAP.STREETS'),
                    layer: osm()
                },
                {
                    slugLabel: 'satellite',
                    label: $translate.instant('MAP.SATELLITE'),
                    layer: satellite()
                }
            ];
        }
    }

    angular.module('driver.map-layers')
    .factory('BaseLayersService', BaseLayersService);
})();
