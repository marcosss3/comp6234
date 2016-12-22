(function () {
    'use strict';

    angular.module('app.main', ['ngRoute'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/', {
                controller: 'mainController'
            });
        }])
        .controller('mainController',mainController) ;

    mainController.$inject = ['$scope'];

    function mainController($scope){
        $scope.title = 'The Effects of the EU Referendum on Tourism';
    }




})();