(function () {
    'use strict';

    angular.module('app.currencyMap', ['ngRoute'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/currencyMap', {
                templateUrl: 'javascript/currency_map/currencymap.html',
                controller: 'currencyMap'
            });
        }])
        .controller('currencyMapController',  currencyMapController)
        .directive('map', function () {
                
            return {
                restrict   : 'E',
                scope      : {
                    data: '='
                },
                link: link
                
            };
            
            function link(scope, element, attrs) {
                scope.$watch('data', function(data) {
                
                    var container = element[0].querySelector('.map');
                    $('.map').empty();
                    
                    var map = new Datamap({
                        element: container,
                        projection: 'mercator',
                        fills: {
                            defaultFill: '#ddd'
                        },
                        data: data,
                        geographyConfig: {
                            popupTemplate: function(geo, data) {
                                var countryInfo = '<div class="hoverinfo"><strong>' +
                                                  geo.properties.name + '</strong><br>' +
                                                  '<strong>Currency: </strong>' +
                                                  data.currency + '<br>';            
                                if(geo.id == "GBR") {
                                    return [countryInfo].join('');
                                } else {
                                    var change;
                                    if(data.percentageChange > 0)
                                        change = '+' + Number(data.percentageChange).toFixed(2);
                                    else
                                        change = Number(data.percentageChange).toFixed(2);
                                         
                                    return [countryInfo +
                                            '<strong>Change After Brexit: </strong>' +
                                            change +
                                            '%</div>'].join('');
                                }
                            },
                            highlightBorderWidth: 3
                        }
                    });
                });       
           }
        });


    currencyMapController.$inject = ['$scope'];

    function currencyMapController($scope) {
        
        $scope.mapDay = 'Day';
        
        $scope.getDayStyle = function (item) {

            if (item === $scope.mapDay) {
                return 'ui button active';
            }
            else {
                return 'ui button';
            }

        }
    
        var currencyDataPath = '/resources/brexit_currencies.csv';
        
        $scope.changeMap = function(day) {
            
            $scope.mapDay = day;
            
            d3v3.csv(currencyDataPath, function(data) {
            
                var dataset = {};
                
                // Determine the min and max for colour palette
                var valuesDay = data.map(function(obj) {return ((obj['Day'] - obj['Brexit'])/obj['Brexit']*100);});
                var valuesMonth = data.map(function(obj) {return ((obj['Month'] - obj['Brexit'])/obj['Brexit']*100);});
                var valuesMonth3 = data.map(function(obj) {return ((obj['Month3'] - obj['Brexit'])/obj['Brexit']*100);});
                var valuesNow = data.map(function(obj) {return ((obj['Now'] - obj['Brexit'])/obj['Brexit']*100);});
                
                var all = valuesDay.concat(valuesMonth).concat(valuesMonth3).concat(valuesNow);
                
                var minValue = Math.min.apply(null, all);var maxValue = Math.max.apply(null, all);
                
                var paletteScale = d3v3.scale.linear()
                    .domain([minValue, 0, maxValue])
                    .range(['#600000', '#EAFFEE', '#004C0F']);
                    
                // Create dataset for map
                for(var i=0; i<data.length; i++) {
                    var iso = data[i]['Country'];
                    var currency = data[i]['Currency'];
                    var brexit = data[i]['Brexit'];
                    var current = data[i][day];
                    
                    var change = (current - brexit)/brexit*100;
                    
                    dataset[iso] = {currency: currency, brexit: brexit, current: current, percentageChange: change, fillColor: paletteScale(change)};
                }
                
                dataset['GBR'] = {currency: 'British Pound', fillColor: '#0000ff'};
                
                $scope.data = dataset;
                $scope.$apply();
            });
            
        }
        
        $scope.changeMap('Day');
        
    }

})();
