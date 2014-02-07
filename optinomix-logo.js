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
//  animate       either "off" (no animation) or the time in seconds for a
//                full cycle of the "bubbles"
//
//  debug         if present, display some extra framework graphical elements

angular.module('optinomix-logo', []).directive('optinomixLogo', [function()
{
  'use strict';

  return {
    restrict: 'E',
    template: ['<div class="optinomix-logo">',
                 '<svg>',
                 '</svg>',
               '</div>'].join(''),
    replace: true,
    scope: false,
    link: function(scope, elm, as) {
      console.log("optinomix-logo link...");
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
      var svg_width = logo_src ? 2.5 * size : size; // TODO: FIX!

      var outer_circle_radius = 0.95 * svg_height / 2;
      var outer_circle_x = svg_height / 2, outer_circle_y = svg_height / 2;

      var ncircles = 12;
      var offset_distance = 56, offset_angle = -45;

      // TODO: SORT THIS OUT
      // var logo_x = 30, logo_y = 5;
      // var logo_fill = "red";
      // var logo_font_size = 180;
      // var logo_font_family = null;
      // var logo_font_style = 'italic';
      // var logo_font_weight = null;
      // var logo_font_variant = null;
      // var logo_font_size = 180;
      // var logo = "ptinomix";

      var animation_speed = as.animation || 10;

      var piN = Math.sin(Math.PI / ncircles);
      var rinvc = offset_distance / 100;
      var xinvc = rinvc * Math.cos(offset_angle / 180.0 * Math.PI);
      var yinvc = rinvc * Math.sin(offset_angle / 180.0 * Math.PI);
      var circout = invert(0, 0, 1);
      var xc0 = circout.x, yc0 = circout.y;
      var sf = outer_circle_radius / circout.r;
      var start = Date.now();

      var xlat = "translate(" + outer_circle_x + "," + outer_circle_y + ")";
      var topsvg = elm.children()[0];
      var svg = d3.select(topsvg)
        .attr("width", svg_width).attr("height", svg_height)
        .append("g").attr("transform", xlat).append("g");
      var maing = svg.append("g");
      var ringg = svg.append("g");

      // svg.selectAll("text").data([logo]).enter().append("text")
      //   .text(logo)
      //   .attr("transform", "translate(" + logo_x + "," + logo_y + ")")
      //   .attr('text-anchor', 'start')
      //   .style('baseline-shift', '-50%')
      //   .style('dominant-baseline', 'middle')
      //   .style('font-size', logo_font_size)
      //   .style('font-family', logo_font_family)
      //   .style('font-style', logo_font_style)
      //   .style('font-weight', logo_font_weight)
      //   .style('font-variant', logo_font_variant)
      //   .attr("fill", logo_fill);

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
    }
  };
}]);
