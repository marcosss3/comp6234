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
    
        var currencyDataPath = '/resources/brexit_currencies.csv';

        function drawMap(day) {
            d3v3.csv(currencyDataPath, function(data) {

                    var dataset = {};
                    
                    var values = data.map(function(obj) {
                        return ((obj[day] - obj['Brexit'])/obj['Brexit']*100);
                    });
                    
                    var minValue = Math.min.apply(null, values);
                    var maxValue = Math.max.apply(null, values);
                    
                    var paletteScale = d3v3.scale.linear()
                            .domain([minValue, maxValue])
                            .range(["#EAFFEE", "#006013"]);
                            
                    // Determine percentage change
                    for(var i=0; i < data.length; i++) {
                        
                        var iso = data[i]['Country'];
                        var currency = data[i]['Currency'];
                        var change = (data[i][day] - data[i]['Brexit'])/data[i]['Brexit']*100;
                        dataset[iso] = {currency: currency, percentageChange: change, fillColor: paletteScale(change)};
                    
                    }
                    
                    $scope.mapObject = {
                        scope: 'world',
                        projection: 'mercator',
                        options: {
                            width: 1100,
                            legendHeight: 60,
                            legend: true
                        },
                        geographyConfig: {
                            highlightBorderColor: '#BADA55',
                            popupTemplate: function(geography, data) {
                                return '<div class="hoverinfo">' +
                                        '<strong>Country: </strong>' + 
                                        geography.properties.name + '<br>' +
                                        '<strong>Currency: </strong>' + 
                                        data.currency + '<br>' +
                                        '<strong>Percentage Change: </strong>' +
                                        Number(data.percentageChange).toFixed(2) +
                                        '%</div>';
                            },
                            highlightBorderWidth: 3
                        },
                        fills: {defaultFill: '#F5F5F5'},
                        data: dataset
                    };             
            }); 
        }
        
        
        $scope.showCurrency = function(day) {
            drawMap(day);
        }   
        
        drawMap('Day');    
        
    }

})();
