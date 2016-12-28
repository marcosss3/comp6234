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
                    data: '=?'
                },
                template: 
                    '<div class="map-wrapper">' +
                    '<div class="map"></div>' +
                    '</div>',
                link: link
            };
            
            function link(scope, element, attrs) {
                
                var width = 938,
                    height = 500;
                
                var projection = d3v3.geo.mercator()
                    .scale(150)
                    .translate([width/2, height/1.5]);
                    
                var path = d3v3.geo.path()
                    .projection(projection);
                    
                var svg = d3v3.select(element[0]).select('.map')
                    .append('svg')
                    .attr("preserveAspectRatio", "xMidYMid")
                    .attr("viewBox", "0 0 " + width + " " + height);
                    
                svg.append("rect")
                    .attr("class", "background")
                    .attr("width", width)
                    .attr("height", height);
                    
                var g = svg.append("g");
                
                d3v3.json("/resources/countries.topo.json", function(error, us) {
                    g.append("g")
                        .attr("id", "countries")
                        .selectAll("path")
                        .data(topojson.feature(us, us.objects.countries).features)
                        .enter()
                        .append("path")
                        .attr("id", function(d) { return d.id; })
                        .attr("d", path);
                });
           }
        });


    currencyMapController.$inject = ['$scope'];

    function currencyMapController($scope) {
    
        var currencyDataPath = '/resources/brexit_currencies.csv';
        $scope.data = {};
        
        
    }

})();
