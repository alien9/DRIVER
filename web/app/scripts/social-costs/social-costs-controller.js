(function () {
    'use strict';

    /* ngInject */
    function SocialCostsController($rootScope, $scope) {
        // N.B.: This Controller backs two different directive templates with
        // similar but not identical functionality. If their functionality
        // diverges further, they should probably be split into separate
        // directives.
        var ctl = this;
        ctl.selectedYear = (new Date()).getFullYear()-1;
        ctl.$onInit = initialize;

        function initialize() {
            ctl.state = 'total';
            ctl.toggle = toggle;
        }

        function toggle() {
            if (ctl.state === 'total') {
                ctl.state = 'subtotal';
                $rootScope.$broadcast('driver.tools.costs.open');
            } else {
                ctl.state = 'total';
            }
        }

        $scope.$on('driver.tools.export.open', function() { ctl.state = 'total'; });
        $scope.$on('driver.tools.interventions.open', function() { ctl.state = 'total'; });
        $scope.$on('driver.tools.charts.open', function() { ctl.state = 'total'; });

        $scope.$on('selectYear', function(event, args) {
            ctl.selectedYear = args;
        });
    }

    angular.module('driver.socialCosts')
      .controller('SocialCostsController', SocialCostsController);

})();
