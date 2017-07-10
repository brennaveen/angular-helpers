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
        .directive('showErrors', /* @ngInject */ function (timeout, $interpolate) {
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
