(function () {
    'use strict';

    /* ngInject */
    function RecordPublicModalController($scope, $modalInstance, $translate, $q, record, recordType, Nominatim,
                                          recordSchema, userCanWrite, JsonEditorDefaults, RecordState, RecordSchemaState,
                                          WebConfig) {
        var ctl = this;
        var bbox = null;
        var suppressReverseNominatim = true;
        ctl.$onInit = initialize();
        function initialize() {
            ctl.record = record;
            ctl.recordType = recordType;
            ctl.recordSchema = recordSchema;
            ctl.userCanWrite = userCanWrite;
            ctl.onGeomChanged = onGeomChanged;
            ctl.close = function () {
                $modalInstance.close();
            };
            ctl.geom = {
                lat: null,
                lng: null
            };


            ctl.hide = function(label){
                if(WebConfig.hiddenFields.indexOf(label) >= 0    ){
                    return true;
                }
                return false;
            };

            $scope.$on('driver.views.record:marker-moved', function(event, data) {
                // update location when map marker set
                $scope.$apply(function() {
                    ctl.geom.lat = data[1];
                    ctl.geom.lng = data[0];
                });

                // update whether we have all constant fields or not
                constantFieldsValidationErrors();
            });

            $scope.$on('driver.views.record:map-moved', function(event, data) {
                bbox = data;
            });

            $scope.$watchCollection(function () { return ctl.geom; }, function (newVal) {
                if (newVal && newVal.lat && newVal.lng) {
                    if(!ctl.nominatimLocationText || !suppressReverseNominatim) {
                        Nominatim.reverse(newVal.lng, newVal.lat).then(function (nominatimData) {
                            /* jshint camelcase: false */
                            ctl.nominatimLocationText = nominatimData.address.road;
                            /* jshint camelcase: true */
                        });
                    } else {
                        suppressReverseNominatim = false;
                    }
                }
            });


            // If there's a record, load it first then get its schema.
            //var schemaPromise;
            //if ($stateParams.recorduuid) {
            //    schemaPromise = loadRecord().then(loadRecordSchema);
            //} else {
                RecordState.getPublic().then(function(recordType){
                    if (recordType) {
                        ctl.recordType = recordType;
                        /* jshint camelcase: false */
                        RecordSchemaState.get(ctl.recordType.current_schema).then(function(recordSchema){
                            ctl.recordSchema = recordSchema;
                            $translate.onReady(onSchemaReady);
                        });
                    } else {
                        ctl.error = $translate.instant('ERRORS.RECORD_SCHEMA_LOAD');
                        return $q.reject(ctl.error);
                    }

                });
            //}


            $scope.$on('$destroy', function() {
                // let map know to destroy its state
                $scope.$emit('driver.views.record:close');
            });


            ctl.nominatimLookup = nominatimLookup;
            ctl.nominatimSelect = nominatimSelect;
        }
        function nominatimLookup(text) {
            return Nominatim.forward(text, bbox);
        }

        function nominatimSelect(item) {
            // a change to ctl.geom will trigger a reverse nominatim lookup,
            // so supress it
            suppressReverseNominatim = true;
            // if the same location is looked up twice, the suppress flag won't be
            // reset and the next reverse lookup will be ignored, so reset it after 500ms
            _.delay(function () { suppressReverseNominatim = false; }, 500);
            ctl.geom.lat = parseFloat(item.lat);
            ctl.geom.lng = parseFloat(item.lon);

            // notify map
            onGeomChanged(true);
        }

        /* Validate the constant value fields, which are not handled by json-editor.
         *
         * @returns {String} error message, which is empty if there are no errors
         */
        function constantFieldsValidationErrors() {
            var required = {
                'latitude': ctl.geom.lat,
                'longitude': ctl.geom.lng
            };

            ctl.constantFieldErrors = {};
            angular.forEach(required, function(value, fieldName) {
                if (!value) {
                    // message formatted to match errors from json-editor
                    ctl.constantFieldErrors[fieldName] = fieldName + ': ' +
                        $translate.instant('ERRORS.VALUE_REQUIRED');
                }
            });
            // make field errors falsy if empty, for partial to check easily
            if (Object.keys(ctl.constantFieldErrors).length === 0) {
                ctl.constantFieldErrors = null;
                return '';
            } else {
                var errors = _.map(ctl.constantFieldErrors, function(message) {
                    return '<p>' + message + '</p>';
                });
                return errors.join('');
            }
        }
        function fixEmptyFields() {
            if (!ctl.record) {
                return;
            }

            _.forEach(ctl.recordSchema.schema.definitions, function(definition, defKey) {
                _.forEach(definition.properties, function(property, propKey) {
                    if (!ctl.record.data.hasOwnProperty(defKey)) {
                        ctl.record.data[defKey] = null;
                    }
                    var data = ctl.record.data[defKey];

                    _.forEach(definition.multiple ? data : [data], function(item) {
                        if (item && !item.hasOwnProperty(propKey)) {
                            item[propKey] = null;
                        }
                    });
                });
            });
        }


        function onSchemaReady() {
            fixEmptyFields();

            // Add json-editor translations for button titles (shown on hover)
            JsonEditorDefaults.addTranslation('button_add_row_title',
                                              $translate.instant('RECORD.BUTTON_ADD_ROW_TITLE'));
            JsonEditorDefaults.addTranslation('button_collapse',
                                              $translate.instant('RECORD.BUTTON_COLLAPSE'));
            JsonEditorDefaults.addTranslation('button_delete_row_title',
                                              $translate.instant('RECORD.BUTTON_DELETE_ROW_TITLE'));
            JsonEditorDefaults.addTranslation('button_expand',
                                              $translate.instant('RECORD.BUTTON_EXPAND'));
            JSONEditor.defaults.editors.object.options.collapsed = false;

            /* jshint camelcase: false */
            ctl.editor = {
                id: 'public-record-editor',
                options: {
                    schema: ctl.recordSchema.schema,
                    disable_edit_json: true,
                    disable_properties: true,
                    disable_array_delete_all_rows: true,
                    disable_array_delete_last_row: true,
                    disable_array_reorder: true,
                    disable_collapse:true,
                    collapsed: false,
                    theme: 'bootstrap3',
                    iconlib: 'bootstrap3',
                    show_errors: 'change',
                    no_additional_properties: true,
                    startval: ctl.record ? ctl.record.data : null,
                    form_name_root: ''
                },
                errors: []
            };
            /* jshint camelcase: true */
        }




        function onGeomChanged(recenter) {
            if (ctl.geom.lat && ctl.geom.lng) {
                $scope.$emit('driver.views.record:location-selected', ctl.geom, recenter);
            }

            // update whether all constant fields are present
            constantFieldsValidationErrors();
        }
    }

    angular.module('driver.views.record')
    .controller('RecordPublicModalController', RecordPublicModalController);

})();
