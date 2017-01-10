/**
 * Created by ayoung on 08/01/17.
 */
(function () {
    'use strict';

    angular.module('app.expenditure', ['ngRoute'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/expenditure', {
                templateUrl: 'javascript/travel_types/expenditure.html',
                controller: 'expenditure'
            });
        }])

        .controller('expenditureController', expenditureController);

    expenditureController.$inject = ['$scope'];

    function expenditureController($scope) {
        $scope.redrawYoY = redrawYoY;
        $scope.data = {};
        drawYoYBarChart("YOYOSExuk");
    }
    
    function redrawYoY(typeOfYoY){
        drawYoYBarChart(typeOfYoY)
    }


    function drawYoYBarChart(typeOfYoY) {
        var dataCsvChangeExpenditure = "/resources/ExpenditureYoY.csv";

        d3.csv(dataCsvChangeExpenditure, function (error, data) {
            var dataReformated = [];
            if (error) throw error;
            data.forEach(function (d) {
                dataReformated.push([d.Date, d[typeOfYoY]])
            });
            d3.select("#expenditureChangeContainer svg").remove();
            d3.select("#expenditureChangeContainer")
                .datum(dataReformated)
                .call(columnChart()
                    .width(1000)
                    .height(400)
                    .x(function(d, i) { return d[0]; })
                    .y(function(d, i) { return d[1]; }));
        });

        function columnChart() {

        var margin = {top: 30, right: 30, bottom: 80, left: 50},
            width = 420,
            height = 420,
            padding = 20,
            xRoundBands = 0.2,
            xValue = function(d) { return d[0]; },
            yValue = function(d) { return d[1]; },
            xScale = d3.scale.ordinal(),
            yScale = d3.scale.linear(),
            yAxis = d3.svg.axis().scale(yScale).orient("left"),
            xAxis = d3.svg.axis().scale(xScale);





        function chart(selection) {

            selection.each(function(data) {

                // Convert data to standard representation greedily;
                // this is needed for nondeterministic accessors.
                data = data.map(function (d, i) {
                    return [xValue.call(data, d, i), yValue.call(data, d, i)];
                });

                // Update the x-scale.
                xScale
                    .domain(data.map(function (d) {
                        return d[0];
                    }))
                    .rangeRoundBands([0, width - margin.left - margin.right], xRoundBands);


                // Update the y-scale.
                yScale
                    .domain(d3.extent(data.map(function (d) {
                        return parseFloat(d[1]);
                    })))
                    .range([height - margin.top - margin.bottom, 0])
                    .nice();


                // Select the svg element, if it exists.
                var svg = d3.select(this).selectAll("svg").data([data]);

                // Otherwise, create the skeletal chart.
                var gEnter = svg.enter().append("svg").append("g");
                gEnter.append("g").attr("class", "bars");
                gEnter.append("g").attr("class", "y axis");
                gEnter.append("g").attr("class", "x axis");
                gEnter.append("g").attr("class", "x axis zero");

                // Update the outer dimensions.
                svg.attr("width", width)
                    .attr("height", height);

                // Update the inner dimensions.
                var g = svg.select("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                // Update the bars.
                var barline = svg.select(".bars").selectAll(".bar").data(data);
                barline.enter().append("rect");
                barline.exit().remove();
                barline.attr("class", function (d, i) {
                    return d[1] < 0 ? "bar negative" : "bar positive";
                })
                    .attr("x", function (d) {
                        return X(d);
                    })
                    .attr("y", function (d, i) {
                        return d[1] < 0 ? Y0() : Y(d);
                    })
                    .attr("width", xScale.rangeBand())
                    .attr("height", function (d, i) {
                        return Math.abs(Y(d) - Y0());
                    });

                // x axis at the bottom of the chart
                g.select(".x.axis")
                    .attr("transform", "translate(0," + (height - margin.top - margin.bottom +10) + ")")
                    .call(xAxis.orient("bottom"))
                    .selectAll("text")
                        .style("text-anchor", "end")
                        .attr("dx", "-.8em")
                        .attr("dy", ".30em")
                        .attr("transform", function(d) {
                            return "rotate(-60)"
                    });

                // zero line
                g.select(".x.axis.zero")
                    .attr("class", "x axis")
                    .append("line")
                    .attr("y1", Y0(0))
                    .attr("y2", Y0(0))
                    .attr("x2", width);


                // Update the y-axis.
                g.select(".y.axis")
                    .call(yAxis);


                // now add titles to the axes
                svg.append("text")
                    .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
                    .attr("transform", "translate("+ (padding/2) +","+(height/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
                    .text("% Change YoY");

                svg.append("text")
                    .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
                    .attr("transform", "translate("+ (width/2) +","+(height-(padding/3))+")")  // centre below axis
                    .text("Date");
            })
        };



// The x-accessor for the path generator; xScale ∘ xValue.
            function X(d) {
                return xScale(d[0]);
            }

            function Y0() {
                return yScale(0);
            }

            // The x-accessor for the path generator; yScale ∘ yValue.
            function Y(d) {
                return yScale(d[1]);
            }

            chart.margin = function(_) {
                if (!arguments.length) return margin;
                margin = _;
                return chart;
            };

            chart.width = function(_) {
                if (!arguments.length) return width;
                width = _;
                return chart;
            };

            chart.height = function(_) {
                if (!arguments.length) return height;
                height = _;
                return chart;
            };

            chart.x = function(_) {
                if (!arguments.length) return xValue;
                xValue = _;
                return chart;
            };

            chart.y = function(_) {
                if (!arguments.length) return yValue;
                yValue = _;
                return chart;
            };

            return chart;
        }



    }


})();