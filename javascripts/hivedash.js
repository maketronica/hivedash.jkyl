function Chart(anchor, data_url) {
  this.anchor = anchor;
  this.data_url = data_url;
  this.draw = drawChart;
}

function drawChart() {
  // Set the dimensions of the canvas / graph
  var margin = {top: 30, right: 20, bottom: 30, left: 50},
      width = 600 - margin.left - margin.right,
      height = 270 - margin.top - margin.bottom;

  // Parse the date / time
  var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S UTC").parse;

  // Set the ranges
  var x = d3.time.scale().range([0, width]);
  var y = d3.scale.linear().range([height, 0]);

  // Define the axes
  var xAxis = d3.svg.axis().scale(x)
      .orient("bottom").ticks(5);

  var yAxis = d3.svg.axis().scale(y)
      .orient("left").ticks(5);

  // Define the line
  var valueline = d3.svg.line()
      .x(function(d) { return x(d.timestamp); })
      .y(function(d) { return y(d.temperature); });

  
  // Adds the svg canvas
  var svg = d3.select(this.anchor)
      .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
      .append("g")
          .attr("transform", 
                "translate(" + margin.left + "," + margin.top + ")");

  // Get the data
  d3.csv(this.data_url, function(error, data) {
      data.forEach(function(d) {
        console.log(d);
          d.timestamp = parseDate(d.timestamp);
          d.temperature = +d.temperature;
        console.log(d);
      });

      // Scale the range of the data
      x.domain(d3.extent(data, function(d) { return d.timestamp; }));
      y.domain([0, d3.max(data, function(d) { return d.temperature; })]);

      var dataNest = d3.nest()
        .key(function(d) { return d.probeid; })
        .entries(data)

      dataNest.forEach(function(d) {
        svg.append("path")
          .attr("class", "line")
          .attr("d", valueline(d.values));
      });

      // Add the X Axis
      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

      // Add the Y Axis
      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis);
  });
}
