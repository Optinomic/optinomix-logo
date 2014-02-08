// Optinomix logo directive
//
// Attributes:
//
//  size          height in pixels (other dimensions calculated from this)
//
//  logo-src      URL for Optinomix logo -- if absent, just the "bubble"
//                animation is shown
//
//  background    background colour for outer circle
//
//  fill          fill colour for bubbles
//
//  stroke        outline stroke colour for bubbles
//
//  stroke-width  outline stroke width for bubbles
//
//  animation     either "off" (no animation) or the time in seconds for a
//                full cycle of the "bubbles"
//
//  debug         if present, display some extra framework graphical elements

angular.module('optinomix-logo', []).directive('optinomixLogo', [function()
{
  'use strict';

  var logo_width_scale = 3.25;
  var logo_width = 296.877;
  var logo_centre_x = 34.406 / 2;
  var logo_centre_y = 13.543 + 33.825 / 2 + 2;

  function preLink(scope, elm, as) {
    var size = as.size || 100;
    var logo_src = as.logoSrc || null;

    var svg_height = size;
    var svg_width = logo_src ? logo_width_scale * size : size;

    scope.topsvg = elm.children()[0];
    $(elm).css("width", svg_width).css("height", svg_height);
    scope.svg = d3.select(scope.topsvg)
      .attr("width", svg_width).attr("height", svg_height)
      .append("g");
  };

  function postLink(scope, elm, as) {
    var size = as.size || 100;
    var logo_src = as.logoSrc || null;
    var debug = as.hasOwnProperty("debug");

    var outer_circle_stroke = debug ? "black" : "none";
    var outer_circle_stroke_width = debug ? 2 : 0;
    var outer_circle_fill = as.background || "#FBFBFB";

    var inner_circle_stroke_width = debug ? 2 : 0;
    var inner_circle_stroke = debug ? "black" : "none";

    var moving_circle_stroke = as.stroke || "#FFA593";
    var moving_circle_fill = as.fill || "#EE3B16";
    var moving_circle_stroke_width = as.strokeWidth || 2;

    var svg_height = size;
    var svg_width = logo_src ? logo_width_scale * size : size;

    var outer_circle_radius = 0.95 * svg_height / 2;
    var outer_circle_x = svg_height / 2, outer_circle_y = svg_height / 2;

    var ncircles = 12;
    var offset_distance = 56, offset_angle = -62;

    var animation_speed = as.animation || 30;

    var piN = Math.sin(Math.PI / ncircles);
    var rinvc = offset_distance / 100;
    var xinvc = rinvc * Math.cos(offset_angle / 180.0 * Math.PI);
    var yinvc = rinvc * Math.sin(offset_angle / 180.0 * Math.PI);
    var circout = invert(0, 0, 1);
    var xc0 = circout.x, yc0 = circout.y;
    var sf = outer_circle_radius / circout.r;
    var start = Date.now();
    var inner_circ = main_circles(true)[1];

    var xlat = "translate(" + outer_circle_x + "," + outer_circle_y + ")";
    scope.svg.attr("transform", xlat).append("g");
    var maing = scope.svg.append("g");
    var ringg = scope.svg.append("g");

    if (logo_src) {
      d3.xml(logo_src, "image/svg+xml", function(xml) {
        var node = document.importNode(xml.documentElement, true);
        var logog = scope.svg.append("g");
        logog.node().appendChild(node);
        var zeroxlat = "translate(" + (-logo_centre_x) + "," +
          (-logo_centre_y) + ")";
        var ctrxlat = "translate(" + inner_circ.x + "," + inner_circ.y + ")";
        var scale_factor = size / 200 * 2;
        var scale = "scale(" + scale_factor + ")";
        logog.attr("transform", ctrxlat + scale + zeroxlat);
      });
    }

    function invert(xi, yi, ri) {
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
    };

    function main_circles(show_inner) {
      var ri = (1 + Math.sin(piN)) / (1 - Math.sin(piN));
      var circin = invert(0, 0, ri);
      var outer_circle = { x: 0, y: 0, r: outer_circle_radius,
                           stroke: outer_circle_stroke,
                           strokeWidth: outer_circle_stroke_width,
                           fill: outer_circle_fill };
      var inner_circle = { x: sf * (circin.x - xc0),
                           y: sf * (circin.y - yc0),
                           r: sf * circin.r,
                           stroke: inner_circle_stroke,
                           strokeWidth: inner_circle_stroke_width };
      return show_inner ? [outer_circle, inner_circle] : [outer_circle];
    };

    function ring_outlines(az) {
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
                       strokeWidth: moving_circle_stroke_width,
                       fill: moving_circle_fill });
      }
      return circles;
    };

    function circles(g, d, first) {
      var cs;
      if (first)
        cs = g.selectAll("circle").data(d).enter().append("circle");
      else
        cs = g.selectAll("circle").data(d);
      cs.attr("transform",
              function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        .attr("r", function(d) { return d.r; })
        .attr("stroke", function(d) { return d.stroke || "black"; })
        .attr("stroke-width", function(d) { return d.strokeWidth || 2; })
        .attr("fill", function(d) { return d.fill || "none"; });
    };

    circles(maing, main_circles(debug), true);
    circles(ringg, ring_outlines(0.0), true);

    if (animation_speed != "off")
      d3.timer(function() {
        var az = -2 * Math.PI * (Date.now() - start) / animation_speed / 1000;
        circles(ringg, ring_outlines(az), false);
      });
  };

  return {
    restrict: 'E',
    template: ['<div class="optinomix-logo">',
                 '<svg>',
                 '</svg>',
               '</div>'].join(''),
    replace: true,
    scope: true,
    compile: function(elm, as, trans) {
      return { pre: preLink, post: postLink };
    }
  };
}]);
