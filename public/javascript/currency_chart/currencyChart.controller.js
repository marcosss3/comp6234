
(function () {
    'use strict';

    angular.module('app.currencyChart', ['ngRoute'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/currencyChart', {
                templateUrl: 'javascript/currency_chart/currencyChart.html',
                controller: 'currencyChart'
            });
        }])
		
        .controller('currencyChartController',  currencyChartController);

		
    function currencyChartController($scope) {		
		//refers to http://bl.ocks.org/DStruths/9c042e3a6b66048b5bd4
		var margin = {top: 20, right: 200, bottom:50, left: 90},
			width = 1000 - margin.left - margin.right,
			height = 500 - margin.top - margin.bottom

		var parseDate = d3.time.format("%m/%d/%Y").parse;
		var formatPercent = d3.format("%");
		var bisectDate = d3.bisector(function(d) { return d.Date; }).left;

		var xScale = d3.time.scale()
			.range([0, width])
			
		var yScale = d3.scale.linear()
			.range([height, 0]);

		var color = d3.scale.category10();

		var xAxis = d3.svg.axis()
			.scale(xScale)
			.orient("bottom")

		var yAxis = d3.svg.axis()
			.scale(yScale)
			.orient("left")
			.ticks(10)
			.tickFormat(formatPercent);  

		var line = d3.svg.line()
			.interpolate("basis")
			.x(function(d) { return xScale(d.Date); })
			.y(function(d) { return yScale(d.Rate); });

		var svg = d3.select("#currencychart").append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
		  .append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
			
		

		// Create invisible rect for mouse tracking
		svg.append("rect")
			.attr("width", width)
			.attr("height", height)                                    
			.attr("x", 0) 
			.attr("y", 0)
			.attr("id", "mouse-tracker")
			.style("fill", "white"); 

		d3.csv("resources/rateschangedata.csv", function(error, data) { 
		  color.domain(d3.keys(data[0]).filter(function(key) {
			return key !== "Date"; 
		  }));

		  data.forEach(function(d) {
			d.Date = +parseDate(d.Date);
			
		  });

		  var categories = color.domain().map(function(name) { 

			return {
			  name: name, 
			  values: data.map(function(d) {
				return {
				  Date: +d.Date, 
				  Rate: +(d[name])/100,
				  };
			  }),
			  visible: (name === "Euro" || name === "US Dollar" || name === "Chinese Yuan" ? true : false) // "visible": all false except for EUR, USD and CNY.
			};
		  });
		  xScale.domain(d3.extent(data, function(d) { return d.Date; }));

		  yScale.domain([
			d3.min(categories, function(c) { return d3.min(c.values, function(v) { return v.Rate; }); }),
			d3.max(categories, function(c) { return d3.max(c.values, function(v) { return v.Rate; }); })
			//-20,1
		  ]);

		  // draw line graph
		  svg.append("g")
			  .attr("class", "x axis")
			  .attr("transform", "translate(0," + height + ")")
			  .call(xAxis);

		  svg.append("g")
			  .attr("class", "y axis")
			  .call(yAxis)
			.append("text")
			  .attr("fill", "#000")
			  .attr("transform", "rotate(-90)")
			  .attr("x", -height / 2)
			  .attr("y", -54)
			  .style("text-anchor", "middle")
			  .text("Change in Exchange Rate(%)");

		  var currency = svg.selectAll(".currency")
			  .data(categories) // Select nested data
			.enter().append("g")
			  .attr("class", "currency");   

		  currency.append("path")
			  .attr("class", "line")
			  .style("pointer-events", "none")
			  .attr("id", function(d) {
				return "line-" + d.name.replace(" ", "").replace("/", ""); 
			  })
			  .attr("d", function(d) { 
				return line(d.values); 
			  })
			  .attr("clip-path", "url(#clip)")
			  .style("stroke", function(d) { return color(d.name) })
			  .style("opacity", function(d) { return d.visible ? '1': '0.1'; });
			  

		  // draw legend
		  var legendSpace = 450 / categories.length;   

		  currency.append("rect")
			  .attr("width", 10)
			  .attr("height", 10)                                    
			  .attr("x", width + (margin.right/3) - 10) 
			  .attr("y", function (d, i) { return i*(legendSpace); })  
			  .attr("fill",function(d) {
				return d.visible ? color(d.name) : "#F1F1F2"; 
			  })
			  .attr("class", "legend-box")

			  .on("click", function(d){ 
				d.visible = !d.visible; 

				svg.select(".y.axis")
				  .transition()
				  .call(yAxis);   

				currency.select("path")
				  .transition()
				  .style("pointer-events", "none")
				  .attr("d", function(d){
					return line(d.values); 
				  })
				  .style("stroke", function(d) { return color(d.name)})
				  .style("opacity", function(d) { return d.visible ? '1': '0.1'; });

				currency.select("rect")
				  .transition()
				  .attr("fill", function(d) {
				  return d.visible ? color(d.name) : "#F1F1F2";
				});
			  })

			  .on("mouseover", function(d){

				d3.select(this)
				  .transition()
				  .attr("fill", function(d) { return color(d.name); });

				d3.select("#line-" + d.name.replace(" ", "").replace("/", ""))
				  .transition()
				  .style("stroke-width", 2.5);  
			  })

			  .on("mouseout", function(d){

				d3.select(this)
				  .transition()
				  .attr("fill", function(d) {
				  return d.visible ? color(d.name) : "#F1F1F2";});

				d3.select("#line-" + d.name.replace(" ", "").replace("/", ""))
				  .transition()
				  .style("stroke-width", 1.5);
			  })
			  
		  currency.append("text")
			  .attr("x", width + (margin.right/3)) 
			  .attr("y", function (d, i) { return i*(legendSpace) + 9; })  
			  .text(function(d) { return d.name; }); 
		  

		  // Hover line 
		  var hoverLineGroup = svg.append("g") 
					.attr("class", "hover-line");

		  var hoverLine = hoverLineGroup // Create line with basic attributes
				.append("line")
					.attr("id", "hover-line")
					.attr("x1", 10).attr("x2", 10) 
					.attr("y1", 0).attr("y2", height + 10)
					.style("pointer-events", "none")
					.style("opacity", 1e-6); 

		  var hoverDate = hoverLineGroup
				.append('text')
					.attr("class", "hover-text")
					.attr("y", height - (height-40))
					.attr("x", width - 150) 
					.style("fill", "#E6E7E8");

		  var columnNames = d3.keys(data[0]) 
						  .slice(1); //remove date

		  var focus = currency.select("g") 
			  .data(columnNames) 
			.enter().append("g") 
			  .attr("class", "focus"); 

		  focus.append("text") 
				.attr("class", "tooltips")
				.attr("x", width + 10) // position tooltips  
				.attr("y", function (d, i) { return i*legendSpace + 9; })
				
		  d3.select("#mouse-tracker") 
		  .on("mousemove", mousemove) 
		  .on("mouseout", function() {
			  hoverDate
				  .text(null) 

			  d3.select("#hover-line")
				  .style("opacity", 1e-6); 
		  });
		  
		  function mousemove() { 
			  var mouse_x = d3.mouse(this)[0]; 
			  var graph_x = xScale.invert(mouse_x); // 
			  
			  var format = d3.time.format('%d %b %y');
			  
			  hoverDate.text(format(graph_x)); 
			  
			  d3.select("#hover-line") 
				  .attr("x1", mouse_x) 
				  .attr("x2", mouse_x)
				  .style("opacity", 1); 

			  var x0 = xScale.invert(d3.mouse(this)[0]), 
			  i = bisectDate(data, x0, 1),
			
			  d0 = data[i - 1],
			  d1 = data[i],
			 
			  d = x0 - d0.Date > d1.Date - x0 ? d1 : d0;
			  focus.select("text").text(function(columnName){
				 return (d[columnName]+'%');
			  });
		  }; 
		  
		  var button1 = d3.select("#all").on('click',show); // Select all currencies
		  var button2 = d3.select("#none").on('click',hide); // Select none
		  
		  function show(){
			categories = color.domain().map(function(name) {

			return {
			  name: name, // 
			  values: data.map(function(d) { 
				return {
				  Date: +d.Date, 
				  Rate: +(d[name])/100,
				  };
			  }),
			  visible: true // "visible": all true.
			};
		  });
		  refresh();
		  }
		  function hide(){
			categories = color.domain().map(function(name) { 
			return {
			  name: name, 
			  values: data.map(function(d) { 
				return {
				  Date: +d.Date, 
				  Rate: +(d[name])/100,
				  };
			  }),
			  visible: false // "visible": all false
			};
		  });
		  refresh();
		  }
		  function refresh(){
		  currency.data(categories).enter();
		  currency.select("path")
			.transition()
			.style("pointer-events", "none")
			.attr("d", function(d){
				return line(d.values); 
			  })
			  .style("opacity", function(d) { return d.visible ? '1': '0.1'; });

			currency.select("rect")
			.transition()
			.attr("fill", function(d) {
			return d.visible ? color(d.name) : "#F1F1F2";
		  });
		  }
		var brexit = new Date(2016, 5, 23, 0, 0, 0, 0);
                    
		var brexitline = svg.append("line")
			.attr("x1", xScale(brexit))
			.attr("y1", 0)
			.attr("x2", xScale(brexit))
			.attr("y2", height)
			.style("stroke-width", 1)
			.style("stroke", "gray")
			.style("fill", "none");
		
		var brexittext = svg.append("text")
			.attr("transform", "translate(" + (xScale(brexit)+10) + "," + 14 + ")")
			.attr("dy", ".35em")
			.attr("text-anchor", "start")
			.style("fill", "gray")
			.text("EU Referendum");
		
		d3.select("#currencychart").attr("align","center");
		  
		}); // End
	}
})();