var _ = require('underscore');

var NUT_RADIUS = 100,
    NUT_CENTER = 2 * NUT_RADIUS,
    NUT_CENTER_RADIUS = NUT_RADIUS - 50,
    TRANSLATE_STRING = "translate(" + NUT_CENTER + ", " + NUT_CENTER + ")";

function dragged() {
  var angle = (Math.atan((d3.event.y - NUT_CENTER) / (d3.event.x - NUT_CENTER)) /
               Math.PI * 180),
      rotateCenter = NUT_CENTER;

  svg.selectAll("path")
     .attr("transform",
           "rotate(" + angle + "," + rotateCenter + "," + rotateCenter + ") " + TRANSLATE_STRING);
}

function nut(data) {
  // TODO: record mouseup location and adjust angle so we don't get jumps on next drag event.
  var centerRadius = data.centerRadius,
      arcRadius = centerRadius / 2,
      path = [],
      radius = data.radius,
      x = radius,
      y = 0;

  path.push("M", x, ",", y);

  path.push.apply(path, _.map(_.range(1, 6), function(i) {
    x = radius * Math.cos(Math.PI * i / 3);
    y = radius * Math.sin(Math.PI * i / 3);

    return "L" + x + "," + y;
  }));

  path.push("Z");
  path.push("M0," + centerRadius);
  path.push("A" + arcRadius + "," + arcRadius + " 0 0,0 0,-" + centerRadius);
  path.push("A" + arcRadius + "," + arcRadius + " 0 0,0 0," + centerRadius);

  return path.join("");
}

var clickedX, clickedY;
var drag = d3.behavior.drag()
             .on("drag", dragged);
var svg = d3.select("svg").call(drag);

svg.append("path")
   .datum({radius: NUT_RADIUS, centerRadius: NUT_CENTER_RADIUS})
   .attr("d", nut)
   .attr("transform", TRANSLATE_STRING);
