(function () {
    'use strict';

    /* ngInject */
    function Nominatim($http, $cookies, WebConfig) {

        var PICKPOINT_NOMINATIM_URL = WebConfig.nominatim.url+'/';
//        PICKPOINT_NOMINATIM_URL = 'https://pickpoint.io/api/v1/';
//        [{"place_id":"133682436","licence":"Data © OpenStreetMap contributors, ODbL 1.0. https:\/\/osm.org\/copyright","osm_type":"way","osm_id":"232362056","boundingbox":["-23.5403975","-23.5402377","-46.5490633","-46.5489547"],"lat":"-23.54031805","lon":"-46.5490089103651","display_name":"Praça Raul Paulis, Carrão, SP, Região Imediata de São Paulo, RMSP, Região Intermediária de São Paulo, SP, Região Sudeste, Brasil","class":"leisure","type":"park","importance":0.25,"address":{"park":"Praça Raul Paulis","city_district":"Carrão","city":"SP","county":"Região Imediata de São Paulo","state_district":"Região Intermediária de São Paulo","state":"SP","country":"Brasil","country_code":"br"}},{"place_id":"125434445","licence":"Data © OpenStreetMap contributors, ODbL 1.0. https:\/\/osm.org\/copyright","osm_type":"way","osm_id":"198648217","boundingbox":["-23.5061727","-23.5058143","-46.5200605","-46.5184973"],"lat":"-23.506092","lon":"-46.518793","display_name":"Travessa Lúcio Paulis, Vila Buenos Aires, Cangaíba, SP, Região Imediata de São Paulo, RMSP, Região Intermediária de São Paulo, SP, Região Sudeste, 03711-008, Brasil","class":"highway","type":"residential","importance":0.2,"address":{"road":"Travessa Lúcio Paulis","suburb":"Vila Buenos Aires","city_district":"Cangaíba","city":"SP","county":"Região Imediata de São Paulo","state_district":"Região Intermediária de São Paulo","state":"SP","postcode":"03711-008","country":"Brasil","country_code":"br"}}]
        var SUGGEST_LIMIT = 15;
        var tokenCookieString = 'AuthService.token';
        var module = {
            forward: forward,
            reverse: reverse
        };
        var token = $cookies.getObject(tokenCookieString);
        return module;

        function forward(text, bboxArray, mapper, filter) {
            var p = {
                key: WebConfig.nominatim.key,
                q: text,
                countrycodes: WebConfig.localization.countryCode,
                limit: SUGGEST_LIMIT,
                addressdetails: 1
            };

            // bboxArray can sometimes be null, which was causing a null ref error
            if (bboxArray) {
                p.viewbox = bboxArray.join(',');
                p.bounded = 1;
            }
            return $http.get(PICKPOINT_NOMINATIM_URL + 'forward', {
                params: p,
                headers: {
                    'Authorization': 'Token '+token,
                    'X-CSRFToken': $cookies.get('csrftoken'),
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }).then(function (result) {
                if(filter){
                    result.data = result.data.filter(filter);
                }
                if(mapper){
                    return result.data.map(mapper);
                }else{
                    return result.data;
                }
            });
        }

        function reverse(x, y) {
            return $http.get(PICKPOINT_NOMINATIM_URL + 'reverse', {
                params: {
                    key: WebConfig.nominatim.key,
                    format: 'json',
                    lat: y,
                    lon: x
                },
                headers: {
                    'Authorization': 'Token '+token,
                    'X-CSRFToken': $cookies.get('csrftoken'),
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }).then(function (result) {
                return result.data;
            });
        }
    }

    angular.module('driver.nominatim')
    .service('Nominatim', Nominatim);

})();
