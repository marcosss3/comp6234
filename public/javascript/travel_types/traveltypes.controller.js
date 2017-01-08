
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

        travelTypeController.$inject = ['$scope'];
        function travelTypeController($scope) {
            var parseTime = d3v4.timeParse("%Y%m%d");
            var dataCsvAbsoluteTravelTypePath = "/resources/ukVisit.csv";
            var dataCsvChangeTravelTypePath = "/resources/ukVisitChange.csv";
            $scope.travelhide = true;

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
                        .call(d3v4.axisBottom(vm.x));

                    vm.g.append("g")
                        .attr("class", "axis axis--y")
                        .call(d3v4.axisLeft(vm.y))
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

                    var brexit = new Date(2016, 5, 23, 0, 0, 0, 0);

                    vm.g.append("line")
                        .attr("x1", vm.x(brexit))
                        .attr("y1", 0)
                        .attr("x2", vm.x(brexit))
                        .attr("y2", vm.height)
                        .style("stroke-width", 1)
                        .style("stroke", "gray")
                        .style("fill", "none");

                    vm.svg.append("text")
                        .attr("transform", "translate(" + (vm.x(brexit)+40) + "," + 20 + ")")
                        .attr("dy", ".35em")
                        .attr("text-anchor", "start")
                        .style("fill", "gray")
                        .text("EU Referendum");

                };


                function createDomain() {
                    vm.x.domain(d3v4.extent(vm.data, function (d) {
                        return d.Date;
                    }));

                    vm.y.domain([
                        d3v4.min(vm.travelTypes, function (c) {
                            return d3v4.min(c.values, function (d) {
                                return d.visitors;
                            });
                        }),
                        d3v4.max(vm.travelTypes, function (c) {
                            return d3v4.max(c.values, function (d) {
                                return d.visitors;
                            });
                        })
                    ]);

                    vm.z.domain(vm.travelTypes.map(function (c) {
                        return c.id;
                    }));
                }



                function createSvg() {
                    vm.svg = d3v4.select("svg#travelTypesAbsolute"),
                        vm.margin = {top: 20, right: 80, bottom: 30, left: 35},
                        vm.width = vm.svg.attr("width") - vm.margin.left - vm.margin.right,
                        vm.height = vm.svg.attr("height") - vm.margin.top - vm.margin.bottom,
                        vm.g = vm.svg.append("g").attr("transform", "translate(" + vm.margin.left + "," + vm.margin.top + ")");
                }

                function setUpAxis() {
                    vm.x = d3v4.scaleTime().range([0, vm.width]),
                    vm.y = d3v4.scaleLinear().range([vm.height, 0]),
                    vm.z = d3v4.scaleOrdinal(d3v4.schemeCategory10);
                }

                function drawLine() {
                    vm.line = d3v4.line()
                        .curve(d3v4.curveBasis)
                        .x(function (d) {
                            return vm.x(d.date);
                        })
                        .y(function (d) {
                            return vm.y(d.visitors);
                        });
                }

                d3v4.csv(dataCsvAbsoluteTravelTypePath, type, function (error, data) {
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
                    vmChange.svg = d3v4.select("svg#travelTypesChange"),
                    vmChange.margin = {top: 60, right: 80, bottom: 50, left: 30},
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

                    var div = d3v4.select("body").append("div")
                        .attr("class", "tooltip")
                        .style("opacity", 0);

                    vmChange.g.append("g")
                        .attr("class", "axis axis--x")
                        .attr("transform", "translate(0," + vmChange.height + ")")
                        .call(d3v4.axisBottom(vmChange.x));

                    vmChange.g.append("g")
                        .attr("class", "axis axis--y")
                        .call(d3v4.axisLeft(vmChange.y))
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
                                    .style("left", (d3v4.event.pageX) + "px")
                                    .style("top", (d3v4.event.pageY - 65) + "px");
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

                    var brexit = new Date(2016, 5, 23, 0, 0, 0, 0);

                    vmChange.g.append("line")
                        .attr("x1", vmChange.x(brexit))
                        .attr("y1", -30)
                        .attr("x2", vmChange.x(brexit))
                        .attr("y2", vmChange.height)
                        .style("stroke-width", 1)
                        .style("stroke", "gray")
                        .style("fill", "none");

                    vmChange.svg.append("text")
                        .attr("transform", "translate(" + (vmChange.x(brexit)+40) + "," + 20 + ")")
                        .attr("dy", ".35em")
                        .attr("text-anchor", "start")
                        .style("fill", "gray")
                        .text("EU Referendum");

                };


                function createDomain() {
                    vmChange.x.domain(d3v4.extent(vmChange.data, function (d) {
                        return d.Date;
                    }));

                    vmChange.y.domain([
                        d3v4.min(vmChange.travelTypes, function (c) {
                            return d3v4.min(c.values, function (d) {
                                return d.visitors;
                            });
                        }),
                        d3v4.max(vmChange.travelTypes, function (c) {
                            return d3v4.max(c.values, function (d) {
                                return d.visitors;
                            });
                        })
                    ]);

                    vmChange.z.domain(vmChange.travelTypes.map(function (c) {
                        return c.id;
                    }));
                }


                function setUpAxis() {
                    vmChange.x = d3v4.scaleTime().range([0, vmChange.width]),
                    vmChange.y = d3v4.scaleLinear().range([vmChange.height, -50]),
                    vmChange.z = d3v4.scaleOrdinal(d3v4.schemeCategory10);
                }

                function drawLine() {
                    vmChange.line = d3v4.line()
                        .curve(d3v4.curveLinear)
                        .x(function (d) {
                            return vmChange.x(d.date);
                        })
                        .y(function (d) {
                            return vmChange.y(d.visitors);
                        });

                }


                var vmChange = {};
                d3v4.csv(dataCsvChangeTravelTypePath, type, function (error, data) {
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
