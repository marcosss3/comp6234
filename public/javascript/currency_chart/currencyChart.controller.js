
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
		var margin = {top: 20, right: 200, bottom: 100, left: 90},
			margin2 = { top: 430, right: 10, bottom: 20, left: 80 },
			width = 1000 - margin.left - margin.right,
			height = 500 - margin.top - margin.bottom,
			height2 = 500 - margin2.top - margin2.bottom;

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
			  .data(categories) // Select nested data and append to new svg group elements
			.enter().append("g")
			  .attr("class", "currency");   

		  currency.append("path")
			  .attr("class", "line")
			  .style("pointer-events", "none") // Stop line interferring with cursor
			  .attr("id", function(d) {
				return "line-" + d.name.replace(" ", "").replace("/", ""); // Give line id of line-(insert currency name, with any spaces replaced with no spaces)
			  })
			  .attr("d", function(d) { 
				return line(d.values); 
			  })
			  .attr("clip-path", "url(#clip)")//use clip path to make irrelevant part invisible
			  .style("stroke", function(d) { return color(d.name) })
			  .style("opacity", function(d) { return d.visible ? '1': '0.1'; });
			  

		  // draw legend
		  var legendSpace = 450 / categories.length; // 450/number of issues (ex. 40)    

		  currency.append("rect")
			  .attr("width", 10)
			  .attr("height", 10)                                    
			  .attr("x", width + (margin.right/3) - 10) 
			  .attr("y", function (d, i) { return i*(legendSpace) - 9; })  // spacing
			  .attr("fill",function(d) {
				return d.visible ? color(d.name) : "#F1F1F2"; // If array key "visible" = true then color rect, if not then make it grey 
			  })
			  .attr("class", "legend-box")

			  .on("click", function(d){ // On click make d.visible 
				d.visible = !d.visible; // If array key for this data selection is "visible" = true then make it false, if false then make it true

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
			  .attr("y", function (d, i) { return i*(legendSpace); })  // (return (11.25/2 =) 5.625) + i * (5.625) 
			  .text(function(d) { return d.name; }); 
		  

		  // Hover line 
		  var hoverLineGroup = svg.append("g") 
					.attr("class", "hover-line");

		  var hoverLine = hoverLineGroup // Create line with basic attributes
				.append("line")
					.attr("id", "hover-line")
					.attr("x1", 10).attr("x2", 10) 
					.attr("y1", 0).attr("y2", height + 10)
					.style("pointer-events", "none") // Stop line interferring with cursor
					.style("opacity", 1e-6); // Set opacity to zero 

		  var hoverDate = hoverLineGroup
				.append('text')
					.attr("class", "hover-text")
					.attr("y", height - (height-40)) // hover date text position
					.attr("x", width - 150) // hover date text position
					.style("fill", "#E6E7E8");

		  var columnNames = d3.keys(data[0]) //grab the key values from your first data row
											 //these are the same as your column names
						  .slice(1); //remove the first column name (`date`);

		  var focus = currency.select("g") // create group elements to house tooltip text
			  .data(columnNames) // bind each column name date to each g element
			.enter().append("g") //create one <g> for each columnName
			  .attr("class", "focus"); 

		  focus.append("text") // http://stackoverflow.com/questions/22064083/d3-js-multi-series-chart-with-y-value-tracking
				.attr("class", "tooltips")
				.attr("x", width + 10) // position tooltips  
				.attr("y", function (d, i) { return i*(legendSpace); }) // (return (11.25/2 =) 5.625) + i * (5.625) // position tooltips   
				
		  // Add mouseover events for hover line.
		  d3.select("#mouse-tracker") // select chart plot background rect #mouse-tracker
		  .on("mousemove", mousemove) // on mousemove activate mousemove function defined below
		  .on("mouseout", function() {
			  hoverDate
				  .text(null) // on mouseout remove text for hover date

			  d3.select("#hover-line")
				  .style("opacity", 1e-6); // On mouse out making line invisible
		  });

		  function mousemove() { 
			  var mouse_x = d3.mouse(this)[0]; // Finding mouse x position on rect
			  var graph_x = xScale.invert(mouse_x); // 
			  
			  var format = d3.time.format('%d %b %y');
			  
			  hoverDate.text(format(graph_x)); // scale mouse position to xScale date and format it to show month and year
			  
			  d3.select("#hover-line") // select hover-line and changing attributes to mouse position
				  .attr("x1", mouse_x) 
				  .attr("x2", mouse_x)
				  .style("opacity", 1); // Making line visible

			  // Legend tooltips // http://www.d3noob.org/2014/07/my-favourite-tooltip-method-for-line.html

			  var x0 = xScale.invert(d3.mouse(this)[0]), /* d3.mouse(this)[0] returns the x position on the screen of the mouse. xScale.invert function is reversing the process that we use to map the domain (date) to range (position on screen). So it takes the position on the screen and converts it into an equivalent date! */
			  i = bisectDate(data, x0, 1), // use our bisectDate function that we declared earlier to find the index of our data array that is close to the mouse cursor
			  /*It takes our data array and the date corresponding to the position of or mouse cursor and returns the index number of the data array which has a date that is higher than the cursor position.*/
			  d0 = data[i - 1],
			  d1 = data[i],
			  /*d0 is the combination of date and rating that is in the data array at the index to the left of the cursor and d1 is the combination of date and close that is in the data array at the index to the right of the cursor. In other words we now have two variables that know the value and date above and below the date that corresponds to the position of the cursor.*/
			  d = x0 - d0.Date > d1.Date - x0 ? d1 : d0;
			  /*The final line in this segment declares a new array d that is represents the date and close combination that is closest to the cursor. It is using the magic JavaScript short hand for an if statement that is essentially saying if the distance between the mouse cursor and the date and close combination on the left is greater than the distance between the mouse cursor and the date and close combination on the right then d is an array of the date and close on the right of the cursor (d1). Otherwise d is an array of the date and close on the left of the cursor (d0).*/

			  //d is now the data row for the date closest to the mouse position

			  focus.select("text").text(function(columnName){
				 //because you didn't explictly set any data on the <text>
				 //elements, each one inherits the data from the focus <g>

				 return (d[columnName]+'%');
			  });
		  }; 
		  
		  var button1 = d3.select("#all").on('click',show); // Select all currencies
		  var button2 = d3.select("#none").on('click',hide); // Select none
		  
		  function show(){
			categories = color.domain().map(function(name) { // Nest the data into an array of objects with new keys

			return {
			  name: name, // "name": the csv headers except date
			  values: data.map(function(d) { // "values": which has an array of the dates and ratings
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
			categories = color.domain().map(function(name) { // Nest the data into an array of objects with new keys
			return {
			  name: name, // "name": the csv headers except date
			  values: data.map(function(d) { // "values": which has an array of the dates and ratings
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
				return line(d.values); // If d.visible is true then draw line for this d selection
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
		  
		}); // End Data callback function
	}
})();