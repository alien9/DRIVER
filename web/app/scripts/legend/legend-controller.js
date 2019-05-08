(function() {
    'use strict';

    /* ngInject */
    function LegendController($scope, $rootScope, MapState, WebConfig){
        var ctl = this;

        ctl.updateLayers = updateLayers;
        init();
        function init(){
            $scope.hasPrimary = false;
            $scope.hasSecondary = false;
            $scope.hasPublic = false;
            $scope.$on('driver-map-layers:prepare', function(e,layers){
                ctl.layers = layers;
            });
            ctl.hasInput = (WebConfig.constants.userInput && (parseInt(WebConfig.constants.userInput)>0));
            $scope.$on('driver.map.overlay:change', ctl.updateLayers);
        }

        function updateLayers(){
            $scope.hasPrimary = MapState.getOverlayState(ctl.layers.primary);
            $scope.hasSecondary = MapState.getOverlayState(ctl.layers.secondary);
            $scope.hasPublic = MapState.getOverlayState(ctl.layers.public);
            ctl.legendClass = ([
                    MapState.getOverlayState(ctl.layers.primary),
                    MapState.getOverlayState(ctl.layers.secondary),
                    MapState.getOverlayState(ctl.layers.public)
                ].filter(function(l){
                        return l;
                    }).length>0)?'on':'off';
        }
    }
    angular.module('driver.legend').controller('LegendController', LegendController);
})();
