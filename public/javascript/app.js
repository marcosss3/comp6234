angular.module('app', [
    'ngRoute',
    'app.main',
    'app.travelType',
    'app.aviationSharePrice',
    'app.currencyMap'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
    $locationProvider.hashPrefix('!');
    $routeProvider.otherwise({redirectTo: '/'});
}]);
