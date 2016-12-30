/**
 * Created by ayoung on 22/12/16.
 */

(function () {
    'use strict';

    angular.module('app.aviationSharePrice', ['ngRoute'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/aviationsp', {
                templateUrl: 'javascript/aviation_share_price/aviationsp.html',
                controller: 'aviationSharePrice'
            });
        }])
        .controller('aviationSharePriceController',  aviationSharePriceController);


    aviationSharePriceController.$inject = ['$scope'];
    

    function aviationSharePriceController($scope) {
        
        $scope.sharePrices = [];

        $scope.currentItem = 'easyjet';
    
        $scope.getStyle = function (item) {

            if (item === $scope.currentItem) {
                return 'ui button active';
            }
            else {
                return 'ui button';
            }

        }

        var palette = ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3'];
        var count = 0;

        var fileName = './data/easyjet.csv';

        var svg = d3v4.select("svg");
        
        var max, min;

        function createShapes(fileName) {

            var margin = {top: 20, right: 20, bottom: 50, left: 70};
            var width = +svg.attr("width") - margin.left - margin.right;
            var height = +svg.attr("height") - margin.top - margin.bottom;
            var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            var parseTime = d3v4.timeParse("%Y-%m-%d");

            var x = d3v4.scaleTime().rangeRound([0, width]);
            var y = d3v4.scaleLinear().rangeRound([height, 0]);

            var line = d3v4.line()
                .x(function (d) {
                    return x(d.Date);
                })
                .y(function (d) {
                    return y(d.Close);
                });

            d3v4.csv(fileName, function (d) {

                d.Date = parseTime(d.Date);
                d.Close = +d.Close;
                return d;

            }, function (error, data) {

                if (error) throw error;

                //x.domain(d3v4.extent(data, function (d) { return d.Date; }));
                x.domain([ 
                    new Date(2016, 0, 1, 0, 0, 0, 0), 
                    new Date(2016, 10, 30, 0, 0, 0, 0)
                ]);
                
                //y.domain([0, d3v4.max(data, function (d) { return d.Close + 50; })]);
                y.domain([ 
                    d3v4.min(data, function (d) { min = d.Close; return d.Close * 0.96; }) , 
                    d3v4.max(data, function (d) { max = d.Close; return d.Close * 1.04; }) 
                ]);

                g.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3v4.axisBottom(x))
                    .append("text")
                    .attr("fill", "#000")
                    .attr("x", width / 2)
                    .attr("y", 46)
                    .style("text-anchor", "middle")
                    .text("Date (2016)");

                g.append("g")
                    .attr("class", "y axis")
                    .call(d3v4.axisLeft(y))
                    .append("text")
                    .attr("fill", "#000")
                    .attr("transform", "rotate(-90)")
                    .attr("x", -height / 2)
                    .attr("y", -54)
                    .style("text-anchor", "middle")
                    .text("Share Price");

                g.append("path")
                    .datum(data)
                    .attr("class", "line")
                    .attr("d", line)
                    .style("stroke-width", 2)
                    .style("stroke", palette[0]);

                var brexit = new Date(2016, 5, 23, 0, 0, 0, 0);

                g.append("line")
                    .attr("x1", x(brexit))
                    .attr("y1", 60)
                    .attr("x2", x(brexit))
                    .attr("y2", height)
                    .style("stroke-width", 1)
                    .style("stroke", "gray")
                    .style("fill", "none");

                svg.append("text")
                    .attr("transform", "translate(" + (x(brexit)+18) + "," + 60 + ")")
                    .attr("dy", ".35em")
                    .attr("text-anchor", "start")
                    .style("fill", "gray")
                    .text("EU Referendum");

            });
            
            /* Add 2015 line */
            
            d3v4.csv(fileName.split('.csv')[0] + '2015.csv', function (d) {

                console.log(min);

                d.Date = parseTime(d.Date.replace("2015", "2016"));
                d.Close = +d.Close;
                return d;

            }, function (error, data2) {

                if (error) throw error;

                g.append("path")
                    .datum(data2)
                    .attr("class", "line")
                    .attr("d", line)
                    .style("stroke-width", 2)
                    .style("stroke-opacity", 0.4)
                    .style("stroke", palette[0]);

            });

        }

        $scope.selectAirline = function (fileName) {

            $scope.currentItem = fileName.split("/")[2].split(".")[0];
            svg.selectAll("*").remove();
            createShapes(fileName);

        };

        createShapes(fileName);


    }

})();
