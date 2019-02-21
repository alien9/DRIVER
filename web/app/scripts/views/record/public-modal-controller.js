(function () {
    'use strict';

    /* ngInject */
    function RecordPublicModalController($scope, $rootScope, $modalInstance, $translate, $log, $state, $stateParams,
            $q, $window, uuid4, record, ownerId, recordType, Nominatim, UserService,
            recordSchema, RecordTypes, userCanWrite, JsonEditorDefaults, PublicRecords, RecordState,
            RecordSchemaState, Notifications, WebConfig) {
        var ctl = this;
        var bbox = null;
        var suppressReverseNominatim = true;
        var editorData = null;
        ctl.$onInit = initialize();
        function initialize() {
            ctl.record = record;
            ctl.recordType = recordType;
            ctl.recordSchema = recordSchema;
            ctl.userCanWrite = userCanWrite;
            ctl.onGeomChanged = onGeomChanged;
            ctl.onSaveClicked = onSaveClicked;
            ctl.onDeleteClicked = onDeleteClicked;
            ctl.ownerId = ownerId;
            ctl.isItMine = isItMine;

            ctl.close = function () {
                $modalInstance.close();
            };
            ctl.geom = {
                lat: null,
                lng: null
            };

            if(ctl.record){
                ctl.geom.lat = ctl.record.geom.coordinates[1];
                ctl.geom.lng = ctl.record.geom.coordinates[0];
                ctl.lat=ctl.geom.lat;
                ctl.lng=ctl.geom.lng;
                /* jshint camelcase: false */
                ctl.nominatimLocationText = ctl.record.location_text;
                /* jshint camelcase: true */
                onGeomChanged(false);
            }

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
                            if(nominatimData.address.road){
                                ctl.nominatimLocationText = nominatimData.address.road;
                                if(nominatimData.address.suburb){
                                    ctl.nominatimLocationText += ' (' + nominatimData.address.suburb + ')';
                                }
                            }else{
                                ctl.nominatimLocationText = '';
                            }
                            /* jshint camelcase: true */
                        });
                    } else {
                        suppressReverseNominatim = false;
                    }
                }
            });

            // If there's a record, load it first then get its schema.
            var schemaPromise;
            if ($stateParams.recorduuid) {
                schemaPromise = loadRecord().then(loadRecordSchema);
            } else {
                RecordState.getPublic().then(function(recordType){
                    if (recordType) {
                        ctl.recordType = recordType;
                        /* jshint camelcase: false */
                        RecordSchemaState.get(ctl.recordType.current_schema).then(function(recordSchema){
                        /* jshint camelcase: true */
                            ctl.recordSchema = recordSchema;
                            $translate.onReady(onSchemaReady);
                        });
                    } else {
                        ctl.error = $translate.instant('ERRORS.RECORD_SCHEMA_LOAD');
                        return $q.reject(ctl.error);
                    }

                });
            }

            $scope.$on('$destroy', function() {
                // let map know to destroy its state
                $scope.$emit('driver.views.record:close');
            });
            ctl.close = function () {
                $modalInstance.close();
            };

            ctl.nominatimLookup = nominatimLookup;
            ctl.nominatimSelect = nominatimSelect;
            Notifications.hide();
        }
        ctl.setMarker = function(m){
            console.log(m);
        };

        var nMapper = function(k){
            /* jshint camelcase: false */
            k.display_name = k.address.road;
            if(k.address.suburb){
                k.display_name += ' (' + k.address.suburb + ')';
            }
            /* jshint camelcase: true */
            return k;
        };
        var nFilter = function(k){return !(!k.address.road);};
        function nominatimLookup(text) {
            return Nominatim.forward(text, bbox, nMapper, nFilter);
        }

        // Helper for loading the record -- only used when in edit mode
        function loadRecord() {
            return PublicRecords.get({ id: $stateParams.recorduuid })
                .$promise.then(function(record) {
                    ctl.record = record;
                    /* jshint camelcase: false */
                    // set lat/lng array into bind-able object
                    ctl.geom.lat = ctl.record.geom.coordinates[1];
                    ctl.geom.lng = ctl.record.geom.coordinates[0];
                    ctl.nominatimLocationText = ctl.record.location_text;
                    /* jshint camelcase: true */

                    // notify map
                    onGeomChanged(false);
                });
        }

        function loadRecordSchema() {
            var typePromise;
            if (ctl.record) {
                typePromise = RecordTypes.query({ record: ctl.record.uuid }).$promise
                    .then(function (result) {
                        var recordType = result[0];
                        return recordType;
                    });
            }

            typePromise = RecordState.getPublic();
            return typePromise.then(function (recordType) {
                if (recordType) {
                    ctl.recordType = recordType;
                    /* jshint camelcase: false */
                    return RecordSchemaState.get(ctl.recordType.current_schema)
                    /* jshint camelcase: true */
                        .then(function(recordSchema) { ctl.recordSchema = recordSchema; });
                } else {
                    ctl.error = $translate.instant('ERRORS.RECORD_SCHEMA_LOAD');
                    return $q.reject(ctl.error);
                }
            });
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
            if(ctl.record){
                onGeomChanged(true);
            }
        }

        ctl.onDataChange = onDataChange;

        function setLocalIds(obj) {
            var changed = false;
            _.each(obj, function(propertyValue, propertyName) {
                if (propertyName === '_localId' && !propertyValue) {
                    obj._localId = uuid4.generate();
                    changed = true;
                } else if (propertyValue instanceof Array) {
                    _.each(propertyValue, function(item) {
                        changed = changed || setLocalIds(item);
                    });
                } else if (propertyValue instanceof Object) {
                    changed = changed || setLocalIds(propertyValue);
                }
            });
            return changed;
        }
        function onDataChange(newData, validationErrors, editor) {

            // Fill in all empty _localId fields
            if (setLocalIds(newData)) {
                editor.setValue(newData);
                return;
            }

            // Update editorData reference: used later during save
            editorData = newData;
            ctl.editor.errors = validationErrors;
        }



        function onGeomChanged(recenter) {
            if (ctl.geom.lat && ctl.geom.lng) {
                $scope.$emit('driver.views.record:location-selected', ctl.geom, recenter);
            }

            // update whether all constant fields are present
            constantFieldsValidationErrors();
        }

        function onDeleteClicked() {
            if ($window.confirm($translate.instant('RECORD.REALLY_DELETE'))) {
                var patchData = {
                    archived: true,
                    uuid: ctl.record.uuid
                };

                PublicRecords.update(patchData, function (record) {
                    $log.debug('Deleted record with uuid: ', record.uuid);
                    $rootScope.$emit('driver.publicrecord:change', record);
                    $modalInstance.close();
                }, function (error) {
                    $log.debug('Error while deleting record:', error);
                    showErrorNotification([
                        '<p>',
                        $translate.instant('ERRORS.CREATING_RECORD'),
                        '</p><p>',
                        error.status,
                        ': ',
                        error.statusText,
                        '</p>'
                    ].join(''));
                });
            }
        }

        function onSaveClicked() {
            var validationErrorMessage = constantFieldsValidationErrors();

            if (ctl.editor.errors.length > 0) {
                $log.debug('json-editor errors on save:', ctl.editor.errors);
                // Errors array has objects each with message, path, and property,
                // where path looks like 'root.Thing Details.Stuff',
                // property like 'minLength'
                // and message like 'Value required'.
                // Show error as 'Stuff: Value required'
                ctl.editor.errors.forEach(function(err) {
                    // strip the field name from the end of the path
                    var fieldName = err.path.substring(err.path.lastIndexOf('.') + 1);
                    validationErrorMessage += ['<p>',
                        fieldName,
                        ': ',
                        err.message,
                        '</p>'
                    ].join('');
                });
                showErrorNotification(validationErrorMessage);
                return;
            } else if (validationErrorMessage.length > 0) {
                // have constant field errors only
                showErrorNotification(validationErrorMessage);
                return;
            }

            // If there is already a record, set the new editorData and update, else create one
            var saveMethod = null;
            var dataToSave = null;

            /* jshint camelcase: false */
            if (ctl.record && ctl.record.geom) {
                // set back coordinates and nominatim values
                ctl.record.geom.coordinates = [ctl.geom.lng, ctl.geom.lat];
                ctl.record.location_text = ctl.nominatimLocationText;
                ctl.record.city = ctl.nominatimCity;
                ctl.record.city_district = ctl.nominatimCityDistrict;
                ctl.record.county = ctl.nominatimCounty;
                ctl.record.neighborhood = ctl.nominatimNeighborhood;
                ctl.record.road = ctl.nominatimRoad;
                ctl.record.state = ctl.nominatimState;
                ctl.record.weather = ctl.weather;
                ctl.record.light = ctl.light;
                if(ctl.recordType.temporal){
                    ctl.record.occurred_from = ctl.occurredFrom;
                    ctl.record.occurred_to = ctl.occurredTo;
                }
                saveMethod = 'update';
                dataToSave = ctl.record;
                dataToSave.data = editorData;
            } else {
                saveMethod = 'create';
                dataToSave = {
                    data: editorData,
                    schema: ctl.recordSchema.uuid,

                    // constant fields
                    geom: 'POINT(' + ctl.geom.lng + ' ' + ctl.geom.lat + ')',
                    location_text: ctl.nominatimLocationText,
                    city: ctl.nominatimCity,
                    city_district: ctl.nominatimCityDistrict,
                    county: ctl.nominatimCounty,
                    neighborhood: ctl.nominatimNeighborhood,
                    road: ctl.nominatimRoad,
                    state: ctl.nominatimState,
                    weather: ctl.weather,
                    light: ctl.light
                };
                if(ctl.recordType.temporal){
                    dataToSave.occurred_from = ctl.occurredFrom;
                    dataToSave.occurred_to = ctl.occurredTo;
                }
            }
            /* jshint camelcase: true */
            PublicRecords.limits().$promise.then(function(limit){
                if(limit.last){
                    if(window.confirm($translate.instant('ERRORS.LIMIT_RECORDS_EXCEEDED')+'\n'+limit.last.locationText+'?')){
                        var patchData = {
                            archived: true,
                            uuid: limit.last.uuid
                        };

                        PublicRecords.update(patchData, function (record) {
                            $log.debug('Deleted record with uuid: ', record.uuid);
                            $rootScope.$emit('driver.publicrecord:change', record);
                        }, function (error) {
                            $log.debug('Error while deleting record:', error);
                            showErrorNotification([
                                '<p>',
                                $translate.instant('ERRORS.CREATING_RECORD'),
                                '</p><p>',
                                error.status,
                                ': ',
                                error.statusText,
                                '</p>'
                            ].join(''));
                        }).$promise.then(onSaveClicked);

                    }else{
                        $modalInstance.close();
                    }
                    return;
                }
                PublicRecords[saveMethod](dataToSave, function (record) {
                    $log.debug('Saved record with uuid: ', record.uuid);
                    $rootScope.$emit('driver.publicrecord:change', record);
                    $modalInstance.close();
                }, function (error) {
                    $log.debug('Error while creating record:', error);
                    var errorMessage = '<p>' + $translate.instant('ERRORS.CREATING_RECORD') + '</p><p>';
                    if (error.data) {
                        errorMessage += _.flatten(_.values(error.data)).join('<br>');
                    } else {
                        errorMessage += (error.status + ': ' + error.statusText);
                    }
                    errorMessage += '</p>';
                    showErrorNotification(errorMessage);
                });

            });

        }

        // helper to display errors when form fails to save
        function showErrorNotification(message) {
            Notifications.show({
                displayClass: 'alert-danger',
                header: $translate.instant('ERRORS.RECORD_NOT_SAVED'),
                html: message
            });
        }
        function isItMine(){
        /* jshint camelcase: false */
            return (!ctl.record || ((ctl.ownerId===ctl.record.modified_by)||ctl.userCanWrite));
        /* jshint camelcase: true */
        }
    }

    angular.module('driver.views.record')
    .controller('RecordPublicModalController', RecordPublicModalController);

})();
