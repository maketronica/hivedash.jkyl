var app = angular.module('chartApp', []);

app.controller('TempChartController', [TempChartController]);
function TempChartController() {
  self = this;
}

app.directive('linearChart', ['$window', linearChartDirective]);
function linearChartDirective($window) {
  self = this;
  var linesToPlot = [];
  
  self.link = function(scope, elem, attrs) {
    self.scope = scope;
    self.elem = elem;
    self.attrs = attrs;
    var columnsToChart = self.attrs.chartColumnNames.split(',')
      .map(function(x) { return $.trim(x) });
    rawSvg().attr("width", width());
    rawSvg().attr("height", height());

    var scale = d3.scale.ordinal()

    d3.csv(self.attrs.chartDataUrl, function(error, data) {
      scale.domain(d3.keys(data[0]).filter(function(key) {
        return ($.inArray(key, columnsToChart) > -1)
      }));

      linesToPlot = scale.domain().map(function(key, index) {
        return { 
          counter: index+1,
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
        
       var lineSet = svg().selectAll(".line")
         .data(linesToPlot)
         .enter().append("g")
         .attr("class", "line");

       lineSet.append("svg:path")
         .attr("class", function(d) {
           return ['line',  d.name, ordclass(d.counter)].join(' ');
         })
         .attr("d", function(d) { return dataLine()(d.values); })
         .style("stroke", function(d) { return scale(d.name); });

    });
  }
  
  var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S UTC").parse;

  var ordclass = function(n) {
    return 'ord' + ordinal(n)
  }

  var ordinal = function(n) {
    var s=["th","st","nd","rd"],
        v=n%100;
    return n+(s[(v-20)%10]||s[v]||s[0]);
  }

  var dataLine = function() {
    return d3.svg.line()
             .x(function (d) { return xScale()(d.x); })
             .y(function (d) { return yScale()(d.y); })
             .interpolate("basis");
  }
  
  var yAxisGen = function() {
    return d3.svg.axis()
             .scale(yScale())
             .orient("left")
             .ticks(5);    
  }
  
   var xAxisGen = function() {
    return d3.svg.axis()
             .scale(xScale())
             .orient("bottom")
             .ticks(8);
  }
  
  var yScale = function() {
    maxY = d3.max(linesToPlot, function (line) {
      return d3.max(line.values, function(d) {
        return d.y;
      })
    })
    return d3.scale.linear()
             .domain([0, maxY])
             .range([height() - padding(), 0]);
  }
  
   var xScale = function() {
    minX = d3.min(linesToPlot, function(line) { return line.values[0].x });
    maxX = d3.max(linesToPlot, function(line) { return line.values[line.values.length-1].x });
    return d3.time.scale()
      .domain([minX, maxX])
      .range([0 + padding(), width()]);
  }
  
   var svg = function() {
    return d3.select(rawSvg()[0]);
  }
  
  var rawSvg = function() {
    return self.elem.find('svg');
  }
  
  var height = function() {
    return self.elem[0].clientHeight
  }
  
  var width = function() {
    return self.elem[0].clientWidth;
  }
    
  var padding = function() {
    return eval(self.attrs.padding);
  }
  
  return {
    restrict:'EA',
    template:"<svg></svg>",
    link: link
  };
};
