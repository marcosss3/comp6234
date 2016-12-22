
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
            var parseTime = d3.timeParse("%Y%m%d");
            var dataCsvAbsoluteTravelTypePath = "/resources/ukVisit.csv";
            var dataCsvChangeTravelTypePath = "/resources/ukVisitChange.csv";

            drawAbsoluteGraph();
            drawChangeGraph();


            function type(d, _, columns) {
                d.Date = parseTime(d.Date);
                for (var i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c];
                return d;
            }


            function drawAbsoluteGraph() {

                var vm = {};
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



                function createSvg() {
                    vm.svg = d3.select("svg#travelTypesAbsolute"),
                        vm.margin = {top: 50, right: 80, bottom: 50, left: 35},
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

                d3.csv(dataCsvAbsoluteTravelTypePath, type, function (error, data) {
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



            function drawChangeGraph() {

                function createSvg() {
                    vmChange.svg = d3.select("svg#travelTypesChange"),
                    vmChange.margin = {top: 50, right: 80, bottom: 50, left: 30},
                    vmChange.width = vmChange.svg.attr("width") - vmChange.margin.left - vmChange.margin.right,
                    vmChange.height = vmChange.svg.attr("height") - vmChange.margin.top - vmChange.margin.bottom,
                    vmChange.g = vmChange.svg.append("g").attr("transform", "translate(" + vmChange.margin.left + "," + vmChange.margin.top + ")");
                }

                function createAxis() {

                    function getDataForLabel(d){
                        var tooltipList = [];
                        for(var key in vmChange.travelTypes){
                            var id = vmChange.travelTypes[key]["id"];
                            for (var data in vmChange.travelTypes[key]["values"]){
                                if(vmChange.travelTypes[key]["values"][data].date.getTime() == d.date.getTime()){
                                    tooltipList.push({"name":id, "value":vmChange.travelTypes[key]["values"][data].visitors})
                                }
                            }
                        }
                        return tooltipList
                    }

                    var div = d3.select("body").append("div")
                        .attr("class", "tooltip")
                        .style("opacity", 0);

                    vmChange.g.append("g")
                        .attr("class", "axis axis--x")
                        .attr("transform", "translate(0," + vmChange.height + ")")
                        .call(d3.axisBottom(vmChange.x));

                    vmChange.g.append("g")
                        .attr("class", "axis axis--y")
                        .call(d3.axisLeft(vmChange.y))
                        .append("text")
                        .attr("transform", "rotate(-90)")
                        .attr("y", 6)
                        .attr("dy", "0.71em")
                        .attr("fill", "#000")
                        .style("text-anchor", "middle")
                        .text("Visitors, % Change");

                    var types = vmChange.g.selectAll(".travelTypes")
                        .data(vmChange.travelTypes)
                        .enter().append("g")
                        .attr("class", "travelTypes");

                    for(var i=0; i<vmChange.travelTypes.length; i++) {
                        var id = vmChange.travelTypes[i].id;
                        types.selectAll("dot")
                            .data(vmChange.travelTypes[i].values)
                            .enter().append("circle")
                            .attr("r", 2)
                            .attr("cx", function (d) {
                                return vmChange.x(d.date);
                            })
                            .attr("cy", function (d) {
                                return vmChange.y(d.visitors);
                            })
                            .attr("class", id)
                            .on("mouseover", function (d) {
                                div.transition()
                                    .duration(100)
                                    .style("opacity", .9);
                                div.html(
                                    getDataForLabel(d)[0].name + " : " + getDataForLabel(d)[0].value + "%<br>"+
                                    getDataForLabel(d)[1].name + " : " + getDataForLabel(d)[1].value + "%<br>"+
                                    getDataForLabel(d)[2].name + " : " + getDataForLabel(d)[2].value + "%<br>"+
                                    getDataForLabel(d)[3].name + " : " + getDataForLabel(d)[3].value + "%<br>"
                                )
                                    .style("left", (d3.event.pageX) + "px")
                                    .style("top", (d3.event.pageY - 65) + "px");
                            })
                            .on("mouseout", function (d) {
                                div.transition()
                                    .duration(500)
                                    .style("opacity", 0);
                            });
                    }


                    types.append("path")
                        .attr("class", "line")
                        .attr("d", function (d) {
                            return vmChange.line(d.values);
                        })
                        .style("stroke", function (d) {
                            return vmChange.z(d.id);
                        });

                    types.append("text")
                        .datum(function (d) {
                            return {id: d.id, value: d.values[d.values.length - 1]};
                        })
                        .attr("transform", function (d) {
                            return "translate(" + vmChange.x(d.value.date) + "," + vmChange.y(d.value.visitors) + ")";
                        })
                        .attr("x", 3)
                        .attr("dy", "0.35em")
                        .style("font", "10px sans-serif")
                        .text(function (d) {
                            return d.id;
                        });
                };


                function createDomain() {
                    vmChange.x.domain(d3.extent(vmChange.data, function (d) {
                        return d.Date;
                    }));

                    vmChange.y.domain([
                        d3.min(vmChange.travelTypes, function (c) {
                            return d3.min(c.values, function (d) {
                                return d.visitors;
                            });
                        }),
                        d3.max(vmChange.travelTypes, function (c) {
                            return d3.max(c.values, function (d) {
                                return d.visitors;
                            });
                        })
                    ]);

                    vmChange.z.domain(vmChange.travelTypes.map(function (c) {
                        return c.id;
                    }));
                }


                function setUpAxis() {
                    vmChange.x = d3.scaleTime().range([0, vmChange.width]),
                    vmChange.y = d3.scaleLinear().range([vmChange.height, -50]),
                    vmChange.z = d3.scaleOrdinal(d3.schemeCategory10);
                }

                function drawLine() {
                    vmChange.line = d3.line()
                        .curve(d3.curveLinear)
                        .x(function (d) {
                            return vmChange.x(d.date);
                        })
                        .y(function (d) {
                            return vmChange.y(d.visitors);
                        });

                }


                var vmChange = {};
                d3.csv(dataCsvChangeTravelTypePath, type, function (error, data) {
                    if (error) throw error;

                    vmChange.data = data;
                    vmChange.travelTypes = vmChange.data.columns.slice(1).map(function (id) {
                        return {
                            id: id,
                            values: vmChange.data.map(function (d) {
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












        };

})();