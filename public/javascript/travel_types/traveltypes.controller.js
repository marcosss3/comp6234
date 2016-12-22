
(function () {
    'use strict';

    angular.module('app.travelType', ['ngRoute'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/travelType', {
                templateUrl: 'javascript/travel_types/traveltypes.html',
                controller: 'TravelTypes'
            });
        }])

        .controller('travelTypeController', travelTypeController);


        function travelTypeController() {
            var vm = this;
            vm.parseTime = d3.timeParse("%Y%m%d");
            vm.dataCsvTravelTypePath = "/resources/ukVisit.csv";


            drawGraph();

            function drawGraph() {

                d3.csv(vm.dataCsvTravelTypePath, type, function (error, data) {
                    if (error) throw error;

                    vm.data = data;
                    vm.travelTypes = vm.data.columns.slice(1).map(function (id) {
                        return {
                            id: id,
                            values: vm.data.map(function (d) {
                                return {date: new Date(d.Date), visitors: d[id]};
                            })
                        };
                    });

                    createSvg();
                    setUpAxis();
                    drawLine();
                    createDomain();
                    createAxis();
                });
            }

            function createSvg() {
                vm.svg = d3.select("svg#travelTypes"),
                    vm.margin = {top: 50, right: 130, bottom: 50, left: 35},
                    vm.width = vm.svg.attr("width") - vm.margin.left - vm.margin.right,
                    vm.height = vm.svg.attr("height") - vm.margin.top - vm.margin.bottom,
                    vm.g = vm.svg.append("g").attr("transform", "translate(" + vm.margin.left + "," + vm.margin.top + ")");
            }

            function setUpAxis() {
                vm.x = d3.scaleTime().range([0, vm.width]),
                    vm.y = d3.scaleLinear().range([vm.height, 0]),
                    vm.z = d3.scaleOrdinal(d3.schemeCategory10);
            }

            function drawLine() {
                vm.line = d3.line()
                    .curve(d3.curveBasis)
                    .x(function (d) {
                        return vm.x(d.date);
                    })
                    .y(function (d) {
                        return vm.y(d.visitors);
                    });

            }


            function type(d, _, columns) {
                d.Date = vm.parseTime(d.Date);
                for (var i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c];
                return d;
            }


            function createDomain() {
                vm.x.domain(d3.extent(vm.data, function (d) {
                    return d.Date;
                }));

                vm.y.domain([
                    d3.min(vm.travelTypes, function (c) {
                        return d3.min(c.values, function (d) {
                            return d.visitors;
                        });
                    }),
                    d3.max(vm.travelTypes, function (c) {
                        return d3.max(c.values, function (d) {
                            return d.visitors;
                        });
                    })
                ]);

                vm.z.domain(vm.travelTypes.map(function (c) {
                    return c.id;
                }));
            }

            function createAxis() {

                vm.g.append("g")
                    .attr("class", "axis axis--x")
                    .attr("transform", "translate(0," + vm.height + ")")
                    .call(d3.axisBottom(vm.x));

                vm.g.append("g")
                    .attr("class", "axis axis--y")
                    .call(d3.axisLeft(vm.y))
                    .append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("dy", "0.71em")
                    .attr("fill", "#000")
                    .text("Visitors, 000's");

                var types = vm.g.selectAll(".travelTypes")
                    .data(vm.travelTypes)
                    .enter().append("g")
                    .attr("class", "travelTypes");

                types.append("path")
                    .attr("class", "line")
                    .attr("d", function (d) {
                        return vm.line(d.values);
                    })
                    .style("stroke", function (d) {
                        return vm.z(d.id);
                    });

                types.append("text")
                    .datum(function (d) {
                        return {id: d.id, value: d.values[d.values.length - 1]};
                    })
                    .attr("transform", function (d) {
                        return "translate(" + vm.x(d.value.date) + "," + vm.y(d.value.visitors) + ")";
                    })
                    .attr("x", 3)
                    .attr("dy", "0.35em")
                    .style("font", "10px sans-serif")
                    .text(function (d) {
                        return d.id;
                    });
            };


        };

})();