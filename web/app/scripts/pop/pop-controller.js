(function () {
    'use strict';

    /* ngInject */
    function PopController($modalInstance, $translate, create){
        var ctl = this;
        ctl.close = function(){
            $modalInstance.close();
        };
        ctl.createPublicRecord = function(){
            $modalInstance.close();
            create();
        };
    }
    angular.module('driver.pop')
    .controller('PopController', PopController);
})();
