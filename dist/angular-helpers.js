(function () {
    'use strict';

    angular.module('bv.ngHelpers', []);

})();
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

(function () {
    'use strict';

    /**
     * directive
     * @name floatOnly
     *
     * @element input[ngModel]
     *
     * @description
     * Replaces any characters that are not integers or decimal points.
     *
     **/

    angular
        .module('bv.ngHelpers')
        .directive('floatOnly', /* @ngInject */ function () {
            var directive = {
                require: 'ngModel',
                link: link
            };
            return directive;

            function link(scope, element, attrs, ctrl) {
                function fromUser(text) {
                    var transformedInput = text.replace(/[^0-9.]/g, '');
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

(function () {
    'use strict';

    /**
     * directive
     * @name gplaceAutocomplete
     *
     * @element input[ngModel]
     *
     * @description
     * An AngularJS directive for adding
     * [Google Places Autocomplete](https://developers.google.com/places/webservice/autocomplete)
     * to an input text element, based on
     * [Will Palahnuk directive](http://github.com/wpalahnuk/ngAutocomplete)
     * (https://developers.google.com/places/webservice/autocomplete)
     *
     * This directive allows address validation: input.$valid will be false as long as the user has
     * not selected an address provided by the Google API.
     *
     * To include validation, add required="required" to your input tag.
     *
     * REQUIRES: <script src="https://maps.googleapis.com/maps/api/js?libraries=places&key=YOUR_API_KEY" async defer></script>
     *
     **/

    angular
        .module('bv.ngHelpers')
        .directive('gplaceAutocomplete', /*@ngInject*/ function ($timeout) {
            var directive = {
                require: 'ngModel',
                scope: {
                    ngModel: '=',
                    options: '=?',
                    details: '=?'
                },
                link: link
            };
            return directive;

            function link(scope, element, attrs, controller) {
                var options;
                var watchEnter = false;
                var required = false;

                // Convert options provided to options
                var initOptions = function () {
                    options = {};

                    if (scope.options) {
                        // Set watchEnter
                        if (scope.options.watchEnter === true) {
                            watchEnter = true;
                        }

                        // Set types
                        if (scope.options.types) {
                            options.types = [];
                            options.types.push(scope.options.types);
                            scope.gPlace.setTypes(options.types);
                        }
                        else {
                            scope.gPlace.setTypes([]);
                        }

                        // Set bounds
                        if (scope.options.bounds) {
                            options.bounds = scope.options.bounds;
                            scope.gPlace.setBounds(options.bounds);
                        }
                        else {
                            scope.gPlace.setBounds(null);
                        }

                        // Set country
                        if (scope.options.country) {
                            options.componentRestrictions = {
                                country: scope.options.country
                            };
                            scope.gPlace.setComponentRestrictions(options.componentRestrictions);
                        }
                        else {
                            scope.gPlace.setComponentRestrictions(null);
                        }

                        // Set strict
                        if (scope.options.strict) {
                            options.strict = scope.options.strict;
                        }
                        else {
                            options.strict = false;
                        }
                    }

                    // Set required
                    if (element.attr('required')) {
                        required = true;
                    }

                };

                if (scope.gPlace === undefined) {
                    scope.gPlace = new google.maps.places.Autocomplete(element[0], {});
                }

                google.maps.event.addListener(scope.gPlace, 'place_changed', function () {
                    var result = scope.gPlace.getPlace();

                    if (result !== undefined) {
                        if (result.address_components !== undefined) {
                            scope.$apply(function () {
                                scope.details = result;

                                controller.$setViewValue(element.val());
                                controller.$setValidity('invalidAddress', true);

                                scope.$emit('place_changed');
                            });
                        }
                        else if (watchEnter) {
                            getPlace(result, function () {
                                controller.$setValidity('invalidAddress', true);

                                scope.$emit('place_changed');
                            });
                        }
                    }
                });

                scope.$watch(function () {
                    return scope.options;
                }, function () {
                    initOptions();
                }, true);

                scope.$watch(function () {
                    return controller.$modelValue;
                }, function (newValue, oldValue) {
                    var res;
                    if (typeof oldValue === 'undefined' && oldValue != newValue) {
                        if (newValue.length > 2) {
                            res = { name: newValue };

                            getPlace(res, function () {
                                controller.$setValidity('invalidAddress', true);
                                scope.$emit('place_changed');
                            });
                        }
                    }
                    else {
                        // Only validate the address if the input is required
                        if (required) {
                            if (typeof newValue === 'undefined'
                                || !newValue
                                || newValue.length < oldValue.length
                                || newValue.length < 2) {
                                controller.$setValidity('invalidAddress', false);
                            }
                        }
                    }
                });

                // Function to get retrieve the autocompletes first result using the AutocompleteService
                function getPlace(result, callback) {
                    var autocompleteService = new google.maps.places.AutocompleteService();

                    if (result.name.length > 0) {
                        autocompleteService.getPlacePredictions({
                            input: result.name,
                            offset: result.name.length
                        }, function listentoresult(list, status) {
                            var addr, placesService;

                            if (list == null || list.length == 0) {
                                scope.$apply(function () {
                                    scope.details = null;
                                });

                                if (typeof callback === 'function') {
                                    callback();
                                }

                            }
                            else {
                                if (options.strict) {
                                    placesService = new google.maps.places.PlacesService(element[0]);

                                    placesService.getDetails({
                                        'placeId': list[0].place_id
                                    }, function detailsresult(detailsResult, placesServiceStatus) {
                                        if (placesServiceStatus == google.maps.GeocoderStatus.OK) {
                                            scope.$apply(function () {

                                                controller.$setViewValue(detailsResult.formatted_address);

                                                element.val(detailsResult.formatted_address);

                                                scope.details = detailsResult;

                                                //on focusout the value reverts, need to set it again.
                                                element.on('focusout', function (event) {
                                                    element.val(detailsResult.formatted_address);
                                                    element.unbind('focusout')
                                                });

                                                if (typeof callback == 'function') {
                                                    callback();
                                                }
                                            });
                                        }
                                    });
                                }
                                else {
                                    addr = list[0].description;

                                    scope.$apply(function () {
                                        controller.$setViewValue(addr);
                                        element.val(addr);

                                        //on focusout the value reverts, need to set it again.
                                        element.on('focusout', function (event) {
                                            element.unbind('focusout');
                                            $timeout(function () {
                                                element.val(addr);
                                            }, 100);
                                        });

                                        if (typeof callback == 'function') {
                                            callback();
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
            }
        });

})();
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
(function () {
    'use strict';

    /**
     * directive
     * @name showErrors
     *
     * @element .form-group or .input-group
     *
     * @description
     * Checks the validity of the child .form-control element on blur or event and applies .has-error or ,has-success.
     * .has-success is not turned on by default, use show-errors="true" to enable.
     *
     * Use this to trigger validity check on form submit:
     * $scope.$broadcast('show-errors-check-validity', { formName: 'myFormName' });
     *
     * Use this to remove has-error/has-success classes:
     * $scope.$broadcast('show-errors-reset', { formName: 'myFormName' });
     *
     * NOTE: created for bootstrap styling only
     *
     **/

    angular
        .module('bv.ngHelpers')
        .directive('showErrors', /* @ngInject */ function ($timeout, $interpolate) {
            var directive = {
                restrict: 'A',
                require: '^form',
                compile: function (elem, attrs) {
                    if (!(elem.hasClass('form-group') || elem.hasClass('input-group'))) {
                        throw 'show-errors element does not have the \'form-group\' or \'input-group\' class';
                    }
                    return link;
                }
            };
            return directive;

            function link(scope, element, attrs, controller) {
                var blurred, inputEl, inputName, inputNgEl, showSuccess, toggleClasses;
                blurred = false;
                inputEl = element[0].querySelector('.form-control[name]');
                inputNgEl = angular.element(inputEl);
                inputName = $interpolate(inputNgEl.attr('name') || '')(scope);
                showSuccess = scope.$eval(attrs.showErrors);

                if (!inputName) {
                    throw 'show-errors element has no child input elements with a \'name\' attribute' +
                    'and a \'form-control\' class';
                }

                inputNgEl.bind('blur', function () {
                    blurred = true;
                    return toggleClasses(controller[inputName].$invalid);
                });

                scope.$watch(function () {
                    var name = $interpolate(inputNgEl.attr('name') || '')(scope);
                    if (name !== inputName) {
                        inputName = name;
                    }
                    return controller[inputName] && controller[inputName].$invalid;
                }, function (invalid) {
                    if (!blurred) {
                        return;
                    }
                    return toggleClasses(invalid);
                });

                scope.$on('show-errors-check-validity', function (event, args) {
                    if (controller.$name === args.formName) {
                        return toggleClasses(controller[inputName].$invalid);
                    }
                });

                scope.$on('show-errors-reset', function (event, args) {
                    if (controller.$name === args.formName) {
                        return $timeout(function () {
                            element.removeClass('has-error');
                            element.removeClass('has-success');
                            blurred = false;
                            return blurred;
                        }, 0, false);
                    }
                });

                toggleClasses = function (invalid) {
                    element.toggleClass('has-error', invalid);

                    if (showSuccess) {
                        element.toggleClass('has-success', !invalid);
                    }

                    return true;
                };
            }
        });

})();

(function () {
    'use strict';

    /**
     * filter
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
(function () {
    'use strict';

    /**
     * filter
     * @name tel
     *
     * @description
     * Pretty print phone numbers
     *
     **/

    angular
        .module('bv.ngHelpers')
        .filter('tel', /* @ngInject */ function () {
            return function (tel) {
                var value = tel.toString().trim().replace(/^\+/, '');
                var country, city, number;

                if (!tel) {
                    return '';
                }

                if (value.match(/[^0-9]/)) {
                    return tel;
                }

                switch (value.length) {
                    case 10: // +1PPP####### -> C (PPP) ###-####
                        country = 1;
                        city = value.slice(0, 3);
                        number = value.slice(3);
                        break;

                    case 11: // +CPPP####### -> CCC (PP) ###-####
                        country = value[0];
                        city = value.slice(1, 4);
                        number = value.slice(4);
                        break;

                    case 12: // +CCCPP####### -> CCC (PP) ###-####
                        country = value.slice(0, 3);
                        city = value.slice(3, 5);
                        number = value.slice(5);
                        break;

                    default:
                        return tel;
                }

                if (country == 1) {
                    country = ''
                }

                number = number.slice(0, 3) + '-' + number.slice(3);

                return ((!country ? '' : country + '-') + city + "-" + number).trim();
            };
        });

})();

(function () {
    'use strict';

    /**
     * filter
     * @name titlecase
     *
     * @description
     * Changes text to title case
     *
     **/

    angular
        .module('bv.ngHelpers')
        .filter('titlecase', /* @ngInject */ function () {
            return function (input) {
                input = input || '';
                return input.replace(/\w\S*/g, function (txt) {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                });
            };
        });

})();
