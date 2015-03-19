var CIRCLE_RADIUS = 50;
var NUM_CIRCLES = 10;
var SPEED = 20;

function stagedCos(t) {
  return function (_, i) {
    return 300 + 100 * Math.cos(t / 1000 * 2 * Math.PI + 2 * i * Math.PI / NUM_CIRCLES);
  };
}

updateImage = function() {
  if (running) {
    circle.attr("cy", stagedCos(index * SPEED));
    index += 1;
  } else {
    return true;
  }
};

d3.timer(updateImage);

var running = true;
var index = 0;
var svg = d3.select("svg")
            .on("click", function() {
              if (!running) {
                d3.timer(updateImage);
              }
              running = !running; 
            });
var data = Array.apply(null, Array(NUM_CIRCLES)).map(function(_, i) {
  return i;
});
var circle = svg.selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", function(d) { return 50 + 110 * d; })
                .attr("cy", function(d) { return 200; })
                .attr("r", CIRCLE_RADIUS);
