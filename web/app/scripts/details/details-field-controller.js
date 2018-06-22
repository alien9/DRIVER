(function () {
    'use strict';

    /* ngInject */
    function DetailsFieldController(WebConfig) {
        var ctl = this;
        initialize();

        function initialize() {

            ctl.hide = function(label){
                return WebConfig.hiddenFields.indexOf(label) >= 0;
            };

        }
    }

    angular.module('driver.details')
    .controller('DetailsFieldController', DetailsFieldController);

})();
