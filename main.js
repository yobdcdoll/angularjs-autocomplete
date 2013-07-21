var app = angular.module('app', ['ngResource']).directive('autocomplete', function() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            remoteData: '&',
            placeholder: '@placeholder',
            selectedItem: '=selectedItem',
            lastLabel: '@',
            lastEvent: '&'
        },
        template: '<div class="input-append btn-group" ' +
        'ng-class="{open: focused && _choices.length>0}"> ' +
        '<input type="text" ng-model="searchTerm" placeholder="{{placeholder}}" ' +
        'tabindex="1" accesskey="s" focused="focused"> ' +
        '<ul class="dropdown-menu span3"> ' +
        '<li ng-repeat="choice in _choices"> ' +
        '<a href="javascript:void(0);" ng-click="selectMe(choice)">{{choice.label}}</a>'+
        '</li>'+
        '<li class="divider" ng-show="lastLabel!=undefined"></li>'+
        '<li ng-show="lastLabel!=undefined"><a href="#" ng-click="lastEvent()">{{lastLabel}}</a></li>'+
        '</ul>',

        controller: function($scope, $element, $attrs) {
            $scope.searchTerm = $scope.selectedItem.label;
            $scope.selectMe = function(choice) {
                $scope.selectedItem = choice;
                $scope.searchTerm = $scope.lastSearchTerm = choice.label;
            };
            $scope.updateSearch = function() {
                if ($scope.canRefresh()) {
                    $scope.searching = true;
                    $scope.lastSearchTerm = $scope.searchTerm;
                    try {
                        $scope.remoteData({
                            request: {
                                term: $scope.searchTerm
                            },
                            response: function(data) {
                                $scope._choices = data;
                                $scope.searching = false;
                            }
                        });
                    } catch (ex) {
                        console.log(ex.message);
                        $scope.searching = false;
                    }
                }
            }
            $scope.$watch('searchTerm', $scope.updateSearch);
            $scope.$watch('selectedItem', function(){
                $scope.searchTerm = $scope.selectedItem.label;
            });
            $scope.canRefresh = function() {
                return ($scope.searchTerm !== "") && ($scope.searchTerm !== $scope.lastSearchTerm) && ($scope.searching != true);
            };
        },
        link: function(scope, iElement, iAttrs, controller) {
            scope._searchTerm = '';
            scope._lastSearchTerm = '';
            scope.searching = false;
            scope._choices = [];
            if (iAttrs.restrict == 'true') {
                var searchInput = angular.element(iElement.children()[0])
                searchInput.bind('blur', function() {
                    if (scope._choices.indexOf(scope.selectedItem) < 0) {
                        scope.selectedItem = null;
                        scope.searchTerm = '';
                    }
                });
            }
        }
    };
}).directive("focused", function($timeout) {
    return function(scope, element, attrs) {
        element.bind('focus', function() {
            scope.$apply(attrs.focused + '=true');
        });
        element.bind('blur', function() {
            $timeout(function() {
                scope.$eval(attrs.focused + '=false');
            }, 200);
        });
        scope.$eval(attrs.focused + '=false')
    }
}).controller('myController',['$scope','$resource',function($scope, $resource){
    $scope.selectedItem = {
        value: 0,
        label: 'zzz'
    };
    $scope.search = function(request, response) {
        response([{
                label: request.term,
                value: request.term
            }, {
                label: request.term.toUpperCase(),
                value: request.term.toUpperCase()
            }, {
                label: request.term.toLowerCase(),
                value: request.term.toLowerCase()
            }
        ]);

    }

    $scope.cancel = function(){
        alert("hello");
    };

    $scope.reset = function(){
        $scope.selectedItem = {
            value: 0,
            label: 'aaa'
        };
    };
}]);