var outer_circle_stroke = "black";
var inner_circle_stroke = "red";
var moving_circle_stroke = "blue";
var moving_circle_centre_fill = "green";

var outer_circle_stroke_width = 5;
var inner_circle_stroke_width = 15;
var moving_circle_stroke_width = 2;

var show_moving_circle_centres = false;
var moving_circle_centre_radius = 1;

var svg_width = 920, svg_height = 420;

var outer_circle_radius = 180;
var outer_circle_x = 200, outer_circle_y = 200;

var ncircles = 20;
var offset_distance = 70, offset_angle = -45;

var logo_x = 30, logo_y = 5;
var logo_fill = "red";
var logo_font_size = 180;
var logo_font_family = null;
var logo_font_style = 'italic';
var logo_font_weight = null;
var logo_font_variant = null;
var logo_font_size = 180;
var logo = "ptinomix";

var animation_speed = 20;

var piN = Math.sin(Math.PI / ncircles);
var rinvc = offset_distance / 100;
var xinvc = rinvc * Math.cos(offset_angle / 180.0 * Math.PI);
var yinvc = rinvc * Math.sin(offset_angle / 180.0 * Math.PI);
var circout = invert(0, 0, 1);
var xc0 = circout.x, yc0 = circout.y;
var sf = outer_circle_radius / circout.r;
var start = Date.now();

var svg = d3.select("body").append("svg")
  .attr("width", svg_width).attr("height", svg_height).append("g")
  .attr("transform", "translate(" + outer_circle_x + "," + outer_circle_y + ")")
  .append("g");
var maing = svg.append("g");
var ringg = svg.append("g");
var centreg = svg.append("g");

svg.selectAll("text").data([logo]).enter().append("text")
  .text(logo)
  .attr("transform", "translate(" + logo_x + "," + logo_y + ")")
  .attr('text-anchor', 'start')
  .style('baseline-shift', '-50%')
  .style('dominant-baseline', 'middle')
  .style('font-size', logo_font_size)
  .style('font-family', logo_font_family)
  .style('font-style', logo_font_style)
  .style('font-weight', logo_font_weight)
  .style('font-variant', logo_font_variant)
  .attr("fill", logo_fill);

function circles(g, d, first)
{
  var cs;
  if (first)
    cs = g.selectAll("circle").data(d).enter().append("circle");
  else
    cs = g.selectAll("circle").data(d);
  cs.attr("transform",
          function(d) { return "translate(" + d.x + "," + d.y + ")"; })
    .attr("r", function(d) { return d.r + (d.radjust || 0); })
    .attr("stroke", function(d) { return d.stroke || "black"; })
    .attr("stroke-width", function(d) { return d.strokeWidth || 2; })
    .attr("fill", function(d) { return d.fill || "none"; });
}

circles(maing, main_circles(), true);

function make_centres(r) {
  var ret = [];
  r.forEach(function(d) {
    ret.push({ x: d.x, y: d.y, r: moving_circle_centre_radius,
               fill: moving_circle_centre_fill });
  });
  return ret;
}

var rs = ring_outlines(0.0);
circles(ringg, rs, true);
if (show_moving_circle_centres)
  circles(centreg, make_centres(rs), true);
d3.timer(function() {
  var az = -2 * Math.PI * (Date.now() - start) / animation_speed / 1000;
  var rs = ring_outlines(az);
  circles(ringg, rs, false);
  if (show_moving_circle_centres)
    circles(centreg, make_centres(rs), false);
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
  var outer_circle = { x: 0, y: 0, r: outer_circle_radius,
                       radjust: outer_circle_stroke_width / 2,
                       stroke: outer_circle_stroke,
                       strokeWidth: outer_circle_stroke_width };
  var inner_circle = { x: sf * (circin.x - xc0),
                       y: sf * (circin.y - yc0),
                       r: sf * circin.r,
                       radjust: -inner_circle_stroke_width / 2,
                       stroke: inner_circle_stroke,
                       strokeWidth: inner_circle_stroke_width };
  return [outer_circle, inner_circle];
}

function ring_outlines(az)
{
  var ri = Math.sin(piN) / (1 - Math.sin(piN));
  var circles = [];
  for (var i = 0; i < ncircles; ++i) {
    var xi = (1 + ri) * Math.cos(az + 2 * i * Math.PI / ncircles);
    var yi = (1 + ri) * Math.sin(az + 2 * i * Math.PI / ncircles);
    var c = invert(xi, yi, ri);
    circles.push({ x: sf * (c.x - xc0),
                   y: sf * (c.y - yc0),
                   r: sf * c.r,
                   stroke: moving_circle_stroke,
                   strokeWidth: moving_circle_stroke_width });
  }
  return circles;
}
