var svg = d3.select("svg");
var data = [1, 2, 3];
var circle = svg.selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", function (d) { return 100 * d; })
                .attr("cy", 50)
                .attr("r", function (d) { return 10 * d; });

svg.on("mousemove", function () {
  var coordinates = d3.mouse(this);
  var originDistance = Math.sqrt(Math.pow(coordinates[0], 2) + Math.pow(coordinates[1], 2));

  svg.selectAll("circle")
     .attr("cx", function(d, i) {
       return 100 * d / originDistance * coordinates[0];
     })
     .attr("cy", function (d, i) {
       return 100 * d / originDistance * coordinates[1];
     });
});
