(function () {
    'use strict';

    /**
     * directive
     * @name integersOnly
     *
     * @element input[ngModel]
     *
     * @description
     * Replaces any characters that are not integers
     *
     **/

    angular
        .module('bv.ngHelpers')
        .directive('integerOnly', /* @ngInject */ function () {
            var directive = {
                require: 'ngModel',
                link: link
            };
            return directive;

            function link(scope, element, attrs, ctrl) {
                function fromUser(text) {
                    var transformedInput = text.replace(/[^0-9]/g, '');
                    if (transformedInput !== text) {
                        ctrl.$setViewValue(transformedInput);
                        ctrl.$render();
                    }
                    return transformedInput;
                }
                ctrl.$parsers.push(fromUser);
            }
        });

})();