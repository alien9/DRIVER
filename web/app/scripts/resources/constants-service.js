(function () {
    'use strict';

    /* ngInject */
    function Constants($resource, WebConfig) {
        var baseUrl = WebConfig.api.hostname + '/api/records/constants/';
        return $resource(baseUrl, {uuid: '@uuid'}, {
            get: {
                method: 'GET'
            },
            query: {
                method: 'GET',
                transformResponse: function(data) {
                    return angular.fromJson(data).results;
                },
                isArray: true
            },
        });
    }

    angular.module('driver.resources')
    .factory('Constants', Constants);

})();
