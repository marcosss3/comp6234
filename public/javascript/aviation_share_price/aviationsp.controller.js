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

            var palette = ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3'];
            var count = 0;

            var fileName = './data/easyjet.csv';

            var svg = d3.select("svg");

            function createShapes(fileName) {

                var margin = {top: 20, right: 20, bottom: 50, left: 70};
                var width = +svg.attr("width") - margin.left - margin.right;
                var height = +svg.attr("height") - margin.top - margin.bottom;
                var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                var parseTime = d3.timeParse("%Y-%m-%d");

                var x = d3.scaleTime().rangeRound([0, width]);
                var y = d3.scaleLinear().rangeRound([height, 0]);

                var line = d3.line()
                    .x(function (d) {
                        return x(d.Date);
                    })
                    .y(function (d) {
                        return y(d.Close);
                    });

                d3.csv(fileName, function (d) {

                    d.Date = parseTime(d.Date);
                    d.Close = +d.Close;
                    return d;

                }, function (error, data) {

                    if (error) throw error;

                    x.domain(d3.extent(data, function (d) {
                        return d.Date;
                    }));
                    y.domain([0, d3.max(data, function (d) {
                        return d.Close + 50;
                    })]);
                    //y.domain([ d3.min(data, function (d) { return d.Close - 50; }) , d3.max(data, function (d) { return d.Close + 50; }) ]);

                    g.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + height + ")")
                        .call(d3.axisBottom(x))
                        .append("text")
                        .attr("fill", "#000")
                        .attr("x", width / 2)
                        .attr("y", 46)
                        .style("text-anchor", "middle")
                        .text("Date (2016)");

                    g.append("g")
                        .attr("class", "y axis")
                        .call(d3.axisLeft(y))
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
                        .style("stroke-width", 3)
                        .style("stroke", palette[0]);

                });

            }

            $scope.selectAirline = function (fileName) {

                svg.selectAll("*").remove();
                createShapes(fileName);

            };

            createShapes(fileName);


        }

})();