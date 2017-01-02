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
        
        var sp = {};
        var parseTime = d3v4.timeParse("%Y-%m-%d");

        $scope.currentItem = 'easyjet';
        var fileName = './data/easyjet.csv';
        var brexit = new Date(2016, 5, 23, 0, 0, 0, 0);
        
        var palette = ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3'];
        
        $scope.getAirlineStyle = function (item) {
            if (item === $scope.currentItem)
                return 'ui button active';
            else
                return 'ui button';
        }
        
        function createSvg () {
            sp.svg = d3v4.select("svg#sharePrices");
            sp.margin = {top: 20, right: 20, bottom: 50, left: 70};
            sp.width = +sp.svg.attr("width") - sp.margin.left - sp.margin.right;
            sp.height = +sp.svg.attr("height") - sp.margin.top - sp.margin.bottom;
            sp.g = sp.svg.append("g").attr("transform", "translate(" + sp.margin.left + "," + sp.margin.top + ")");
        }
        
        function setupAxes () {
            sp.x = d3v4.scaleTime().rangeRound([0, sp.width]);
            sp.y = d3v4.scaleLinear().rangeRound([sp.height, 0]);
        }
        
        function drawLine () {
            sp.line = d3v4.line()
                .x(function (d) {
                    return sp.x(d.date);
                })
                .y(function (d) {
                    return sp.y(d.close);
                });
        }
        
        function createAxes () {
            
            sp.g.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate(0," + sp.height + ")")
                .call(d3v4.axisBottom(sp.x))
                .append("text")
                .attr("fill", "#000")
                .attr("x", sp.width / 2)
                .attr("y", 46)
                .style("text-anchor", "middle")
                .text("Date");

            sp.g.append("g")
                .attr("class", "y axis")
                .call(d3v4.axisLeft(sp.y))
                .append("text")
                .attr("fill", "#000")
                .attr("transform", "rotate(-90)")
                .attr("x", -sp.height / 2)
                .attr("y", -54)
                .style("text-anchor", "middle")
                .text("Share Price");

            sp.g.append("path")
                .data(sp.sharePrices)
                .attr("class", "line")
                .attr("d", function (d) {
                    return sp.line(d.values);
                })
                .style("stroke-width", 2)
                .style("stroke", palette[0]);
            
            sp.g.append("path")
                .data(sp.sharePrices2015)
                .attr("class", "line")
                .attr("d", function (d) {
                    return sp.line(d.values);
                })
                .style("stroke-width", 2)
                .style("stroke-opacity", 0.4)
                .style("stroke", palette[0])

            sp.g.append("line")
                .attr("x1", sp.x(brexit))
                .attr("y1", 60)
                .attr("x2", sp.x(brexit))
                .attr("y2", sp.height)
                .style("stroke-width", 1)
                .style("stroke", "gray")
                .style("fill", "none");

            sp.svg.append("text")
                .attr("transform", "translate(" + (sp.x(brexit)+18) + "," + 60 + ")")
                .attr("dy", ".35em")
                .attr("text-anchor", "start")
                .style("fill", "gray")
                .text("EU Referendum");
            
        }
        
        function createDomain () {
            //x.domain(d3v4.extent(data, function (d) { return d.Date; }));
            sp.x.domain([ 
                new Date(2016, 0, 2, 0, 0, 0, 0), 
                new Date(2016, 10, 30, 0, 0, 0, 0)
            ]);

            //y.domain([0, d3v4.max(data, function (d) { return d.Close + 50; })]);
            sp.y.domain([ 
                d3v4.min(sp.data, function (d) { return d.Close * 0.96; }) , 
                d3v4.max(sp.data, function (d) { return d.Close * 1.04; }) 
            ]);

        }

        function loadData (fileName) {

            d3v4.csv(fileName, function (error, data) {
                
                if (error) throw error;
                
                sp.data = data;
                
                sp.sharePrices = sp.data.map(function (id) {
                    return {
                        id: 0,
                        values: sp.data.map(function (d) {
                            return {date: parseTime(d.Date), close: +d.Close};
                        })
                    };
                });
                
                d3v4.csv(fileName.split('.csv')[0] + '2015.csv', function (error, data2) {
                    
                    Array.prototype.push.apply(sp.data,data2);
                    
                    sp.sharePrices2015 = data2.map(function () {
                        return {
                            id: 1,
                            values: data2.map(function (d) {
                                return {date: parseTime(d.Date.replace("2015", "2016")), close: +d.Close};
                            })
                        };
                    });
                    
                    createSvg();
                    setupAxes();
                    drawLine();
                    createDomain();
                    createAxes();

                });
                
            });
            
        }

        $scope.selectAirline = function (fileName) {
            $scope.currentItem = fileName.split("/")[2].split(".")[0];
            sp.svg.selectAll("*").remove();
            loadData(fileName);
        };

        loadData(fileName);

    }

})();
