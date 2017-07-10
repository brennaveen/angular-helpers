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