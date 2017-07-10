(function () {
    'use strict';

    /**
     * directive
     * @name titlecase
     *
     * @description
     * Changes text to title case
     *
     **/

    angular
        .module('bv.ngHelpers')
        .filter('titlecase', function () {
            return function (input) {
                input = input || '';
                return input.replace(/\w\S*/g, function (txt) {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                });
            };
        });

})();
