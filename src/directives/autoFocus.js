(function () {
    'use strict';

    /**
     * directive
     * @name autoFocus
     *
     * @description
     * Focuses element on controller initialization.
     *
     **/

    angular
        .module('bv.ngHelpers')
        .directive('autoFocus', /* @ngInject */ function ($timeout) {
            return {
                restrict: 'AC',
                link: function(_scope, _element) {
                    $timeout(function(){
                        _element[0].focus();
                    }, 0);
                }
            };

        });

})();
