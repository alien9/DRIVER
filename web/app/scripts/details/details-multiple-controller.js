(function () {
    'use strict';

    /* ngInject */
    function DetailsMultipleController(WebConfig) {
        var ctl = this;
        ctl.maxDataColumns = 4;
        ctl.hide = function(label){
            return WebConfig.hiddenFields.indexOf(label) >= 0;
        };
    }

    angular.module('driver.details')
    .controller('DetailsMultipleController', DetailsMultipleController);

})();
