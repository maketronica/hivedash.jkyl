var app = angular.module('chartApp', []);

app.controller('TempChartController', [TempChartController]);
function TempChartController() {
  self = this;
}

app.directive('linearChart', ['$window', linearChartDirective]);
function linearChartDirective($window) {
  self = this;
  var dataToPlot = [];
  
  self.link = function(scope, elem, attrs) {
    self.scope = scope;
    self.elem = elem;
    self.attrs = attrs;
    var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S UTC").parse;
    rawSvg().attr("width", width());
    rawSvg().attr("height", height());

    d3.csv(self.attrs.chartDataUrl, function(error, data) {
      data.forEach(function(d) {
          d.x = parseDate(d.timestamp);
          d.y = +d.temperature1;
          console.log(d.x);
      })
      
      dataToPlot = data;

      svg().append("svg:g")
        .attr("class", "x axis")
        .attr("transform", "translate(0,"+(height() - padding())+")")
        .call(xAxisGen());
        
      svg().append("svg:g")
        .attr("class", "y axis")
        .attr("transform", "translate("+padding()+",0)")
        .call(yAxisGen());
        
      svg().append("svg:path")
        .attr({
          d: dataLine()(dataToPlot),
          "class": pathClass()
        });
    });
  }
  
  self.dataLine = function() {
    return d3.svg.line()
             .x(function (d) { return xScale()(d.x); })
             .y(function (d) { return yScale()(d.y); })
             .interpolate("basis");
  }
  
  self.yAxisGen = function() {
    return d3.svg.axis()
             .scale(yScale())
             .orient("left")
             .ticks(5);    
  }
  
  self.xAxisGen = function() {
    return d3.svg.axis()
             .scale(xScale())
             .orient("bottom")
             .ticks(8);
  }
  
  self.yScale = function() {
    return d3.scale.linear()
             .domain([0, d3.max(dataToPlot, function (d) {
               return d.y;
             })])
             .range([height() - padding(), 0]);
  }
  
  self.xScale = function() {
    return d3.time.scale()
      .domain([dataToPlot[0].x, dataToPlot[dataToPlot.length-1].x])
      .range([0 + padding(), width()]);
  }
  
  self.svg = function() {
    return d3.select(rawSvg()[0]);
  }
  
  self.rawSvg = function() {
    return self.elem.find('svg');
  }
  
  self.height = function() {
    return self.elem[0].clientHeight
  }
  
  self.width = function() {
    return self.elem[0].clientWidth;
  }
    
  self.pathClass = function() {
    return self.attrs.pathClass;
  }
  
  self.padding = function() {
    return eval(self.attrs.padding);
  }
  
  return {
    restrict:'EA',
    template:"<svg></svg>",
    link: link
  };
};


function Chart(anchor, data_url) {
  this.anchor = anchor;
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
  d3.csv('/data/temperatures.csv', function(error, data) {
      data.forEach(function(d) {
          d.timestamp = parseDate(d.timestamp);
          d.temperature = +d.temperature;
          d.temperature2 = +d.temperature2;
      });

      // Scale the range of the data
      x.domain(d3.extent(data, function(d) { return d.timestamp; }));
      y.domain([0, d3.max(data, function(d) { return Math.max(d.temperature, d.temperature2); })]);

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
