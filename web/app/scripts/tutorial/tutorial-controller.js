(function () {
    'use strict';

    /* ngInject */
    function TutorialController($scope){
        var ctl = this;
        var page = 0;
        ctl.close = function(){
            $scope.$emit('driver.exitTutorial');
        };
        ctl.pageUp = function(){
            page++;
        };
        ctl.pageDown = function(){
            page--;
        };
        ctl.isThisPage = function(n){
            return page===n;
        };
    }
    angular.module('driver.tutorial')
    .controller('TutorialController', TutorialController);
})();
