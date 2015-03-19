var CIRCLE_SPACING = 1;
var CIRCLE_RADIUS = 6;
var NUM_CIRCLES = 80;
var NUM_CYCLES = 2;
var SPEED = 4;
var SVG_HEIGHT = 650;

function dragged(_, i) {
  if (d3.event.y > CIRCLE_RADIUS && d3.event.y < SVG_HEIGHT - CIRCLE_RADIUS) {
    var position = d3.event.y;
    var scaledPosition = (position - CIRCLE_RADIUS) / (SVG_HEIGHT - 2 * CIRCLE_RADIUS) * 2 - 1;
    svg.selectAll("circle")
       .attr("cy", function(_, ia) {
         if (ia != i) {
           return stagedCos(ia - i, Math.acos(scaledPosition) / NUM_CYCLES);
         } else {
           return position;
         }
       })
       .attr("fill", function(_, ia) {
         var color;
         if (ia != i) {
           color = Math.floor(Math.abs(
                                       (stagedCos(ia - i, Math.acos(scaledPosition) /
                                        NUM_CYCLES) -
                                       CIRCLE_RADIUS) /
                                       (SVG_HEIGHT - 2 * CIRCLE_RADIUS) * 2 - 1) *
                              255);
         } else {
           color = 0;
         }
         return "rgb(" + color + ", 0, 0)";
       });
  }
}

function stagedCos(i, position) {
  var center = SVG_HEIGHT / 2;
  var fieldSize = SVG_HEIGHT - 2 * CIRCLE_RADIUS;
  return center + fieldSize / 2 *
         Math.cos((position + i * 2 * Math.PI / NUM_CIRCLES) * NUM_CYCLES);
}

var drag = d3.behavior.drag()
             .on("drag", dragged);
var start = Date.now();
var svg = d3.select("svg");
var data = Array.apply(null, Array(NUM_CIRCLES)).map(function(_, i) {
  return i;
});
var circle = svg.selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", function(d) {
                  return CIRCLE_RADIUS + (2 * CIRCLE_RADIUS + CIRCLE_SPACING) * d;
                })
                .attr("cy", function(d) { return 200; })
                .attr("r", CIRCLE_RADIUS)
                .call(drag);
