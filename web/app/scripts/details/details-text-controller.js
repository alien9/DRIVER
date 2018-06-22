(function () {
    'use strict';

    /* ngInject */
    function DetailsTextController($rootScope, WebConfig) {
        var ctl = this;
        ctl.maxLength = 20;

        ctl.xShift = function() {
            /**
             * Magic numbers:
             * 300 - 125 is svg-width - compact width
             * 300 - 200 is svg.width - !compact width
             */
            if ($rootScope.isRightToLeft) {
                return ctl.compact ? 300 - 125 : 300 - 200;
            } else {
                return 0;
            }
        };
        ctl.hide = function(label){
            return WebConfig.hiddenFields.indexOf(label) >= 0;
        };
    }

    angular.module('driver.details')
    .controller('DetailsTextController', DetailsTextController);

})();
