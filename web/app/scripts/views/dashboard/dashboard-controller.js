(function () {
    'use strict';

    /* ngInject */
    function DashboardController($scope, $state, $timeout,
                                 FilterState, InitialState, Records,
                                 RecordSchemaState, RecordState, RecordAggregates, WebConfig) {
        var ctl = this;
        ctl.selectedYear = null;
        ctl.showBlackSpots = WebConfig.blackSpots.visible;

        InitialState.ready().then(init);

        function init() {
            RecordState.getSelected().then(function(selected) { ctl.recordType = selected; })
                .then(loadRecordSchema)
                .then(loadRecords)
                .then(onRecordsLoaded);

            $scope.$on('driver.state.recordstate:selected', function(event, selected) {
                ctl.recordType = selected;
                loadRecords();
            });

            $scope.$on('driver.state.boundarystate:selected', function() {
                loadRecords();
            });
            $scope.$on('driver.savedFilters:filterSelected', function(event, selectedFilter) {
                $state.go('map');
                $timeout(function () {
                    FilterState.restoreFilters(selectedFilter);
                }, 2000);  // this needs to be quite long to avoid race conditions, unfortunately
            });
            $scope.$on('selectYear', function(event, args) {
                loadRecords(args);
            });
        }

        function loadRecordSchema() {
            /* jshint camelcase: false */
            var currentSchemaId = ctl.recordType.current_schema;
            /* jshint camelcase: true */
            return RecordSchemaState.get(currentSchemaId)
                .then(function(recordSchema) {
                    ctl.recordSchema = recordSchema;
                    ctl.lastYear=(new Date()).getFullYear()-1;
                });
        }

        /*
         * Loads records for charts
         * @return {promise} Promise to load records
         */
        function loadRecords(year) {
            // We need to see the 3 whole years from the thing

            var y;
            if(!year){
                if(!ctl.selectedYear){
                    y = (new Date()).getFullYear();
                }else{
                    y = ctl.selectedYear + 1;
                }
            }else{
                y = year+1;
            }
            ctl.selectedYear = y - 1;

            /* jshint camelcase: false */
            var params = {
              occurred_min: new Date(y-3, 0, 1).toISOString(),
              occurred_max: new Date(y-1, 11, 30, 23, 59, 59).toISOString()
            };
            /* jshint camelcase: true */

            var filterConfig = {
                doAttrFilters: false,
                doBoundaryFilter: true,
                doJsonFilters: false
            };

            RecordAggregates.toddow(params, filterConfig).then(function(toddowData) {
                ctl.toddow = toddowData;
            });

            RecordAggregates.socialCosts(params, filterConfig).then(
                function(costs) {
                    ctl.socialCosts = costs;
                },
                function(error) {
                    ctl.socialCosts = error;
                }
            );

            // The stepwise widget is only displayed when black spots are not visible
            if (!ctl.showBlackSpots) {
                RecordAggregates.stepwise(params).then(function(stepwiseData) {
                    /* jshint camelcase: false */
                    ctl.minDate = params.occurred_min;
                    ctl.maxDate = params.occurred_max;
                    /* jshint camelcase: true */
                    ctl.stepwise = stepwiseData;
                    ctl.lastYear=(new Date()).getFullYear()-1;
                });
            }
        }

        function onRecordsLoaded() {
            var detailsDefinitions = _.filter(ctl.recordSchema.schema.definitions, 'details');
            ctl.propertiesKey = detailsDefinitions[0].properties;
            ctl.headerKeys = _.without(_.keys(ctl.propertiesKey), '_localId');
        }
    }

    angular.module('driver.views.dashboard')
    .controller('DashboardController', DashboardController);

})();
