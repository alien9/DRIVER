(function () {
    'use strict';

    /* ngInject */
    function RecordDetailsModalController($modalInstance, record, recordType,
                                          recordSchema, userCanWrite, RecordState, WebConfig) {
        var ctl = this;
        initialize();

        function initialize() {
            ctl.record = record;
            ctl.recordType = recordType;
            ctl.recordSchema = recordSchema;
            ctl.userCanWrite = userCanWrite;

            ctl.close = function () {
                $modalInstance.close();
            };

            ctl.hide = function(label){
                if(WebConfig.hiddenFields.indexOf(label) >= 0    ){
                    return true;
                }
                return false;
            };

            RecordState.getSecondary().then(function (secondaryType) {
                if (!!secondaryType && secondaryType.uuid === ctl.recordType.uuid) {
                    ctl.record.isSecondary = true;
                } else {
                    ctl.record.isSecondary = false;
                }
                ctl.isSecondary = ctl.record.isSecondary;
            });
            RecordState.getTertiary().then(function (type) {
                if (!!type && type.uuid === ctl.recordType.uuid) {
                    ctl.record.isTertiary = true;
                } else {
                    ctl.record.isTertiary = false;
                }
            });
        }
    }

    angular.module('driver.views.record')
    .controller('RecordDetailsModalController', RecordDetailsModalController);

})();
