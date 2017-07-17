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

    angular.module('bv.ngHelpers', [])
        .filter('contains', /* @ngInject */ function ($parse) {
            return function (collection, expression) {

                collection = isObject(collection) ? toArray(collection) : collection;

                if (!isArray(collection) || isUndefined(expression)) {
                    return false;
                }

                return collection.some(function (elm) {
                    return ((isString(expression) && isObject(elm)) || isFunction(expression))
                        ? $parse(expression)(elm)
                        : elm === expression;
                });

            }
        });

})();