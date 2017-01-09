angular.module('app', [
    'ngRoute',
    'app.main',
    'app.travelType',
    'app.aviationSharePrice',
    'app.currencyMap',
	'app.currencyChart',
    'app.expenditure'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
    $locationProvider.hashPrefix('!');
    $routeProvider.otherwise({redirectTo: '/'});
}]);
