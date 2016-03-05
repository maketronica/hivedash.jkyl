var app = angular.module('chartApp', []);

app.controller('TempChartController', [TempChartController]);
function TempChartController() {
  self = this;
}

app.directive('linearChart', ['$window', linearChartDirective]);
function linearChartDirective($window) {
  self = this;
  var lines = [];
  
  self.link = function(scope, elem, attrs) {
    self.scope = scope;
    self.elem = elem;
    self.attrs = attrs;
    var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S UTC").parse;
    rawSvg().attr("width", width());
    rawSvg().attr("height", height());

    var scale = d3.scale.ordinal()
    var colors = ["#FF0000", "#FFFF00", "#000000", "#FF00FF"];
    scale.range(colors);

    d3.csv(self.attrs.chartDataUrl, function(error, data) {
      scale.domain(d3.keys(data[0]).filter(function(key) {
        return key !== "timestamp" && key !== "probeid";
      }));

      lines = scale.domain().map(function(key) {
        return { 
          name: key,
          values: data.map(function(d) {
            var newd =  { x: parseDate(d.timestamp), y: +d[key] };
            return newd;
          })
        };
      });

      svg().append("svg:g")
        .attr("class", "x axis")
        .attr("transform", "translate(0,"+(height() - padding())+")")
        .call(xAxisGen());
        
      svg().append("svg:g")
        .attr("class", "y axis")
        .attr("transform", "translate("+padding()+",0)")
        .call(yAxisGen());
        
       var foo = svg().selectAll(".line")
         .data(lines)
         .enter().append("g")
         .attr("class", "line");

       foo.append("path")
         .attr("class", "line")
         .attr("d", function(d) { return dataLine()(d.values); })
         .style("stroke", function(d) { return scale(d.name); });

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
    maxY = d3.max(lines, function (line) {
      return d3.max(line.values, function(d) {
        return d.y;
      })
    })
    return d3.scale.linear()
             .domain([0, maxY])
             .range([height() - padding(), 0]);
  }
  
  self.xScale = function() {
    minX = d3.min(lines, function(line) { return line.values[0].x });
    maxX = d3.max(lines, function(line) { return line.values[line.values.length-1].x });
    return d3.time.scale()
      .domain([minX, maxX])
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
