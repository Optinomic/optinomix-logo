var width = 200, height = width, rmain = width/2;
var ncirc = 12, off = 56;

var color_bg = "#FBFBFB";
var color_bub_fill = "#EE3B16";
var color_bub_outline = "#FFA593";


if (ncirc < 3) ncirc = 3;
if (ncirc > 100) ncirc = 100;
var piN = Math.sin(Math.PI / ncirc);
var rinvc = off / 100;
var xinvc = rinvc, yinvc = 0;
var circout = invert(0, 0, 1);
var xc0 = circout.x, yc0 = circout.y;
var sf = rmain / circout.r;
var speed = 35, start = Date.now();

var svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
  .append("g");
var maing = svg.append("g");
var ringg = svg.append("g");

maing.selectAll("circle").data(main_circles())
  .enter().append("circle")
  .attr("transform",
        function(d) { return "translate(" + d.x + "," + d.y + ")"; })
  .attr("r", function(d) { return d.r; })
  .attr("stroke", function(d) { return d.stroke; })
  .attr("stroke-width", 40).attr("fill", color_bg);

ringg.selectAll("circle").data(ring_outlines(0.0))
  .enter().append("circle")
  .attr("transform",
        function(d) { return "translate(" + d.x + "," + d.y + ")"; })
  .attr("r", function(d) { return d.r; })
  .attr("stroke", function(d) { return d.stroke; })
  .attr("stroke-width", 1).attr("fill", "none");

d3.timer(function() {
  var az = 2 * Math.PI * (Date.now() - start) / speed / 1000;
  ringg.selectAll("circle").data(ring_outlines(az))
    .attr("transform",
          function(d) { return "translate(" + d.x + "," + d.y + ")"; })
    .attr("r", function(d) { return d.r; })
    .attr("stroke", function(d) { return d.stroke; })
    .attr("stroke-width", 1).attr("fill", color_bub_fill);
});


function invert(xi, yi, ri){
  var rad = Math.sqrt(Math.pow(xinvc - xi, 2) + Math.pow(yinvc - yi, 2))
  var rnear = rad - ri, rfar = rad + ri;
  var rcc = ((1 / rfar) + (1 / rnear)) / 2;
  var rc = Math.abs(((1 / rfar) - (1 / rnear)) / 2);
  var xc = 0, yc = 0;
  if (rad !== 0) {
    xc = xinvc + (rcc / rad) * (xi - xinvc);
    yc = yinvc + (rcc / rad) * (yi - yinvc);
  }
  return { x: xc, y: yc, r: rc };
}

function main_circles()
{
  var ri = (1 + Math.sin(piN)) / (1 - Math.sin(piN));
  var circin = invert(0, 0, ri);
  return [{ x: 0, y: 0, r: rmain, stroke: "none" },
          { x: sf * (circin.x - xc0),
            y: sf * (circin.y - yc0),
            r: sf * circin.r, stroke: "white" }];
}

function ring_outlines(az)
{
  var ri = Math.sin(piN) / (1 - Math.sin(piN));
  var circles = [];
  for (var i = 0; i < ncirc; ++i) {
    var xi = (1 + ri) * Math.cos(az + 2 * i * Math.PI / ncirc);
    var yi = (1 + ri) * Math.sin(az + 2 * i * Math.PI / ncirc);
    var c = invert(xi, yi, ri);
    circles.push({ x: sf * (c.x - xc0), y: sf * (c.y - yc0), r: sf * c.r,
                   stroke: color_bub_outline });
  }
  return circles;
}
