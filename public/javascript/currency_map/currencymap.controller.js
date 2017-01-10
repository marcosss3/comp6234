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
                var valuesMonth6 = data.map(function(obj) {return ((obj['Month6'] - obj['Brexit'])/obj['Brexit']*100);});
                
                var all = valuesDay.concat(valuesMonth).concat(valuesMonth3).concat(valuesMonth6);
                
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
                
                /* Set the legend */
                var legendColours = [];
                var legendRange;
                var legendMin;
                var legendMax;
                    
                /* Legends will be different depending on the map displayed
                   Sort the colours of the map to display the legend 
                   Add a 0 to month 3 and 6 because there are negative values which will alter the legend */
                switch(day) {
                    case 'Day':   
                        legendMin = Math.min.apply(null, valuesDay);
                        legendMax = Math.max.apply(null, valuesDay);
                                       
                        valuesDay.sort(function (a, b) {return a-b;});
                        
                        for(var i=0; i < valuesDay.length; i++)
                            legendColours.push(paletteScale(valuesDay[i]));
                            
                        legendRange = d3v3.scale.linear()
                            .range(legendColours);
                            
                        break;
                    case 'Month':  
                        legendMin = Math.min.apply(null, valuesMonth);
                        legendMax = Math.max.apply(null, valuesMonth);
                                          
                        valuesMonth.sort(function (a, b) {return a-b;});
                        
                        for(var i=0; i < valuesMonth.length; i++)
                            legendColours.push(paletteScale(valuesMonth[i]));
                            
                        legendRange = d3v3.scale.linear()
                            .range(legendColours);
                            
                        break;
                    case 'Month3':  
                        valuesMonth3.push(0);
                        legendMin = Math.min.apply(null, valuesMonth3);
                        legendMax = Math.max.apply(null, valuesMonth3);
                                             
                        valuesMonth3.sort(function (a, b) {return a-b;});
                        
                        for(var i=0; i < valuesMonth3.length; i++)
                            legendColours.push(paletteScale(valuesMonth3[i]));
                            
                        legendRange = d3v3.scale.linear()
                            .range(legendColours);
                            
                        break;
                    case 'Month6':  
                        valuesMonth6.push(0);
                        legendMin = Math.min.apply(null, valuesMonth6);
                        legendMax = Math.max.apply(null, valuesMonth6);
                                             
                        valuesMonth6.sort(function (a, b) {return a-b;});
                        
                        for(var i=0; i < valuesMonth6.length; i++)
                            legendColours.push(paletteScale(valuesMonth6[i]));
                            
                        legendRange = d3v3.scale.linear()
                            .range(legendColours);
                            
                        break;
                }
                    
                d3v3.select("#map-legend").select("svg").remove();
                
                var key = d3v3.select("#map-legend")
                .append("svg")
                    .attr("width", 900)
                    .attr("height", 50);
                    
                var zero = 0;
                var legend = key.append("defs")
                    .append("svg:linearGradient")
                    .attr("id", "gradient")
                    .attr("x1", "0%")
                    .attr("x2", "100%")
                    .attr("y1", "0%")
                    .attr("y2", "0%")
                    .selectAll("stop")
                    .data(legendRange.range())
                    .enter().append("stop")
                    .attr("offset", function(d,i) {
                        // If there is a zero, store where it is on the legend
                        if(d === '#eaffee')
                            zero = i;
                        return i/(legendRange.range().length-1);
                        })
                    .attr("stop-color", function(d) {return d;});
                    

                key.append("rect")
                    .attr("width", 900)
                    .attr("height", 15)
                    .style("fill", "url(#gradient)")
                    .attr("transform", "translate(0, 10)");
                
                /* If there is a zero, draw two axes for positive and negative numbers
                    Otherwise, the numbers appear jumbled and incorrect */
                if(zero === 0) {

                    var xScale = d3.scale.linear()
                        .range([0, 900])
                        .domain([legendMin, legendMax]);
                        
                    var xAxis = d3v3.svg.axis()
                        .orient("bottom")
                        .ticks(5)
                        .tickFormat(function(d) {return d + "%"})
                        .scale(xScale);
                    
                    key.append("g")
                        .attr("class", "axis")
                        .attr("transform", "translate(0,25)")
                        .call(xAxis);
                } else {
                
                    var xScaleNeg = d3.scale.linear()
                        .range([0, zero*5])
                        .domain([legendMin, 0]);
                        
                    var xAxisNeg = d3v3.svg.axis()
                        .orient("bottom")
                        .ticks(0)
                        .tickFormat(function(d) {return d + "%"})
                        .scale(xScaleNeg);
                    
                    key.append("g")
                        .attr("class", "axis")
                        .attr("transform", "translate(0,25)")
                        .call(xAxisNeg);
                    
                    var xScalePos = d3.scale.linear()
                        .range([zero*5, 900])
                        .domain([0, legendMax]);
                        
                    var xAxisPos = d3v3.svg.axis()
                        .orient("bottom")
                        .tickFormat(function(d) {return d + "%"})
                        .scale(xScalePos);
                    
                    key.append("g")
                        .attr("class", "axis")
                        .attr("transform", "translate(0,25)")
                        .call(xAxisPos);
                }       
            });
            
        }
        
        $scope.changeMap('Day');
        
    }

})();
