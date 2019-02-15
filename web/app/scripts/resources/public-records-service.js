(function () {
    'use strict';

    /* ngInject */
    function PublicRecords($resource, WebConfig) {
        var baseUrl = WebConfig.api.hostname + '/api/publicrecords/';
        return $resource(baseUrl + ':id/', {
            id: '@uuid',
            archived: 'False' // Note: a regular 'false' boolean doesn't filter properly in DRF
        }, {
            create: {
                method: 'POST'
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
            }
        });
    }

    angular.module('driver.resources')
    .factory('PublicRecords', PublicRecords);

})();
