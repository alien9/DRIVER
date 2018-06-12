(function () {
    'use strict';

    /* ngInject */
    function DirectiveConfig() {
    }

    angular.module('driver.socialCosts', [
        'driver.resources',
        'driver.state',
        'ui.bootstrap'
    ]).config(DirectiveConfig).filter(
        'localNumber', function($translate){
            return function(input, chars){
                if(isNaN(input)){
                    return null;
                }
                var ip = (Math.floor(input)).toString();
                var mil = function(k){
                    var c = k.match(/\d{1,3}$/).pop();
                    ip = ip.substring(0, ip.length-c.length);
                    return c;
                };
                var res = mil(ip);
                while(ip.length){
                    res = mil(ip) + $translate.instant('NUMBER.THOUSAND_SEPARATOR') + res;
                }
                if(chars  && (!isNaN(chars)) && (chars>0)){
                    if(chars>16){
                        chars=16;
                    }
                    return res + $translate.instant('NUMBER.DECIMAL_SEPARATOR') + (Math.round(Math.pow(10, chars) * input - Math.floor(input)));
                }
                return res;
            };
        }
    );

})();
