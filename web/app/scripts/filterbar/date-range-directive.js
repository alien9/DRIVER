(function () {
    'use strict';

    /* ngInject */
    function DateRangeField(DateLocalization, WebConfig) {
        var module = {
            restrict: 'A',
            require: ['^driver-filterbar', 'date-range-field'],
            templateUrl: 'scripts/filterbar/date-range.html',
            controller: 'dateRangeController',
            link: function(scope, elem, attrs, ctlArray) {
                var calendar = null;
                var filterLabel = '__dateRange';
                var filterBarCtl = ctlArray[0];
                var dateRangeCtl = ctlArray[1];
                var dtRange = {};  // internal min/max date strings, used for API
                // scope.min and scope.max are localized strings for display


                scope.$on('driver.filterbar:reset', function() {
                    init();
                });

                /**
                 * Restore a user's saved dates; this comes in from the localstorage as an
                 * ISO-8601 string, so we need to convert that to a localized CDate so that
                 * we can display it to the user.
                 */
                scope.$on('driver.filterbar:restored', function(event, filter) {
                    if (filter.label === filterLabel) {
                        // The restored date will be an ISO-8601 string, so we need to convert
                        // that to a Javascript Date, and then convert that to a localized CDate,
                        // and then store the formatted string.
                        dtRange.min = filter.value.min;
                        dtRange.max = filter.value.max;
                        if (dtRange.min) {
                            var jsMin = moment(dtRange.min, moment.ISO_8601).toDate();
                            scope.min = calendar.formatDate(
                                scope.calendarOptions.dateFormat,
                                calendar.fromJSDate(jsMin)
                            );
                            $('#dtMinField').calendarsPicker('setDate', calendar.fromJSDate(jsMin));
                        }
                        if (dtRange.max) {
                            var jsMax = moment(dtRange.max, moment.ISO_8601).toDate();
                            scope.max = calendar.formatDate(
                                scope.calendarOptions.dateFormat,
                                calendar.fromJSDate(jsMax)
                            );
                            $('#dtMaxField').calendarsPicker('setDate', calendar.fromJSDate(jsMax));
                        }
                        scope.isMinMaxValid();
                    }
                });

                /**
                 * Update the scope and dtRange date variables whenever a new date is selected
                 * in the calendarPicker. This is fired by the calendar's onSelect action.
                 * @param date {CDate} The newly selected date, as a CDate.
                 * @param minOrMax {string} A string specifying 'min' or 'max'.
                 */
                function updateDate(date, minOrMax) {
                    scope[minOrMax] = calendar.formatDate(scope.calendarOptions.dateFormat, date);
                    var gregCDate = DateLocalization.convertToCalendar(date, 'gregorian', 'en');
                    var gregISODate = gregCDate._calendar.toJSDate(gregCDate).toJSON();
                    dtRange[minOrMax] = gregISODate;
                    scope.updateFilter();
                }

                /**
                 * Sets up the calendar picker based on the current language.
                 */
                function configureDatePicker() {
                    var dateConfig = DateLocalization.currentDateFormats();
                    calendar = $.calendars.instance(dateConfig.calendar, dateConfig.language);
                    $.calendarsPicker.setDefaults($.calendarsPicker.regionalOptions['']);
                    scope.calendarOptions = angular.extend({
                        calendar: calendar,
                        dateFormat: dateConfig.formats.numeric,
                        showAnim: '',
                        onShow: function(calElem) {
                            calElem.on('click', function(e) {
                                e.stopPropagation();
                            });
                            calElem.find('.calendars-cmd').on('click', function(e) {
                                e.stopPropagation();
                            });
                        }
                    }, $.calendarsPicker.regionalOptions[dateConfig.language]);

                    // Make sure that the datepicker hides when the parent dropdown does
                    elem.on('hide.bs.dropdown', function() {
                        $('.date-range-input').calendarsPicker('hide');
                    });

                }

                /**
                 * Sets calendar with default dates and appropriate callbacks.
                 */
                function init() {
                    // Make sure the calendar is set up
                    configureDatePicker();

                    // Today
                    var year = WebConfig.constants.lastYear;
                    var defaultMax = new Date(year+1, 0, 1);
                    var defaultMin = new Date(year, 0, 1);
                    $('#dtMaxField')
                        .calendarsPicker(scope.calendarOptions)
                        .calendarsPicker('setDate', calendar.fromJSDate(defaultMax))
                        .calendarsPicker('option', 'onSelect', function(dates) {
                            if (dates.length > 0) { updateDate(dates[0], 'max'); }
                        });
                    $('#dtMinField')
                        .calendarsPicker(scope.calendarOptions)
                        .calendarsPicker('setDate', calendar.fromJSDate(defaultMin))
                        .calendarsPicker('option', 'onSelect', function(dates) {
                            if (dates.length > 0) { updateDate(dates[0], 'min'); }
                        });

                    scope.min = calendar.formatDate(
                        scope.calendarOptions.dateFormat,
                        calendar.fromJSDate(defaultMin)
                    );
                    scope.max = calendar.formatDate(
                        scope.calendarOptions.dateFormat,
                        calendar.fromJSDate(defaultMax)
                    );

                    scope.error = {};
                    scope.updateFilter();
                }

                /**
                 * A simple wrapper around driver-filterbar's updateFilter function;
                 *  filters should only be updated when data validates
                 *
                 * @param filterLabel {string} label of which field to filter
                 * @param filterObj {object} filter data
                 */
                scope.updateFilter = function() {
                    if (scope.isMinMaxValid()) {
                        filterBarCtl.updateFilter(filterLabel, dtRange);
                    }
                };

                /**
                 * When called, evaluate filter.min and filter.max to ensure they're valid;
                 * set classes properly by copying controller's `error` value to this scope
                 */
                scope.isMinMaxValid = function() {
                    var validity = dateRangeCtl.isMinMaxValid({
                        min: dtRange.min,
                        max: dtRange.max
                    });
                    scope.error = dateRangeCtl.error;
                    return validity;
                };

                /**
                 * Called by ng-change on date picker fields; ensures that the calendarPicker's
                 * onSelect function is called when the user manually types in the date field.
                 *
                 * @param minOrMax {string} Whether the user updated the 'min' field or the 'max'
                 */
                scope.onDtRangeChange = function(minOrMax) {
                    if (minOrMax === 'min') {
                        $('#dtMinField').calendarsPicker('setDate', scope.min);
                    } else if (minOrMax === 'max') {
                        $('#dtMaxField').calendarsPicker('setDate', scope.max);
                    }
                };

                // Initialize to 90 days by default.
                // Must be called after the other scope variables are defined, since
                // init references scope.
                init();
            }
        };
        return module;
    }

    angular.module('driver.filterbar')
    .directive('dateRangeField', DateRangeField);

})();
