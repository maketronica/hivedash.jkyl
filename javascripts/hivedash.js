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
          d.y = +d[self.attrs.chartColumnName];
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
