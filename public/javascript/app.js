angular.module('app', [
    'ngRoute',
    'datamaps',
    'app.main',
    'app.travelType',
    'app.aviationSharePrice',
    'app.currencyMap'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
    $locationProvider.hashPrefix('!');
    $routeProvider.otherwise({redirectTo: '/'});
}]);
