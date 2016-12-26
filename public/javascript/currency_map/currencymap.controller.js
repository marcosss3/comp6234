(function () {
    'use strict';

    angular.module('app.currencyMap', ['ngRoute'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/currencyMap', {
                templateUrl: 'javascript/currency_map/currencymap.html',
                controller: 'currencyMap'
            });
        }])
        .controller('currencyMapController',  currencyMapController);


    currencyMapController.$inject = ['$scope'];

    function currencyMapController($scope) {
        $scope.mapObject = {
            scope: 'world',
            options: {
                width: 1100,
                height: 700
            },
        }
    }

})();
