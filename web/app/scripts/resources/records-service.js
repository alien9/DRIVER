(function () {
    'use strict';

    /* ngInject */
    function Records($resource, WebConfig) {
        var baseUrl = WebConfig.api.hostname + '/api/records/';
        return $resource(baseUrl + ':id/', {
            id: '@uuid',
            archived: 'False' // Note: a regular 'false' boolean doesn't filter properly in DRF
        }, {
            create: {
                method: 'POST'
            },
            'create-request': {
                method: 'POST',
                url: WebConfig.api.hostname + '/api/requestrecords/'
            },
            get: {
                method: 'GET'
            },
            query: {
                method: 'GET',
                transformResponse: function(data) { return angular.fromJson(data).results; },
                isArray: true
            },
            update: {
                method: 'PATCH'
            },
            'update-request': {
                method: 'PATCH',
                url: WebConfig.api.hostname + '/api/requestrecords/'
            },
            toddow: {
                url: baseUrl + 'toddow/',
                method: 'GET',
                isArray: true
            },
            stepwise: {
                url: baseUrl + 'stepwise/',
                method: 'GET',
                isArray: true
            },
            recentCounts: {
                method: 'GET',
                url: baseUrl + 'recent_counts_last_3_years/'
            },
            report: {
                url: baseUrl + 'crosstabs/',
                method: 'GET'
            },
            socialCosts: {
                url: baseUrl + 'costs/',
                method: 'GET'
            }
        });
    }

    angular.module('driver.resources')
    .factory('Records', Records);

})();
