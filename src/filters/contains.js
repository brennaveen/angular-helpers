(function () {
    'use strict';

    /**
     * directive
     * @name contains
     *
     * @description
     * Checks if given expression is present in one or more object in the collection
     *
     **/

    angular.module('bv.ngHelpers')
        .filter('contains', /* @ngInject */ function ($parse) {
            return function (collection, expression) {

                collection = angular.isObject(collection) ? toArray(collection) : collection;

                if (!angular.isArray(collection) || angular.isUndefined(expression)) {
                    return false;
                }

                return collection.some(function (elm) {
                    return ((angular.isString(expression) && angular.isObject(elm)) || angular.isFunction(expression))
                        ? $parse(expression)(elm)
                        : elm === expression;
                });

                function toArray(object) {
                    return angular.isArray(object)
                        ? object
                        : Object.keys(object).map(function (key) {
                            return object[key];
                        });
                }
            }
        });

})();