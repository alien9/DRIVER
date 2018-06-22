(function () {
    'use strict';

    /* ngInject */
    function DetailsSelectlistController(WebConfig) {
        var ctl = this;
        init();

        function init() {
            if (Array.isArray(ctl.data)) {
                ctl.data = ctl.data.join('; ');
            }
            ctl.hide = function(label){
                return WebConfig.hiddenFields.indexOf(label) >= 0;
            };

        }
    }

    angular.module('driver.details')
    .controller('DetailsSelectlistController', DetailsSelectlistController);

})();
