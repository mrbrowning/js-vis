var _ = require('underscore');

var NUT_RADIUS = 100,
    NUT_CENTER = 2 * NUT_RADIUS,
    NUT_CENTER_RADIUS = NUT_RADIUS - 50,
    TRANSLATE_STRING = "translate(" + NUT_CENTER + ", " + NUT_CENTER + ")";

function angleTo(angleX, angleY, centerX, centerY) {
  return Math.atan2(angleX - centerX, angleY - centerY);
}

function toDegrees(angle) {
  return angle / Math.PI * 180;
}

function dragged() {
  dragAngle = (
    toDegrees(angleTo(d3.event.x, d3.event.y, NUT_CENTER, NUT_CENTER)) * -1 + adjustmentAngle
  );

  // Normalize the angle so that it remains in the range -180 <= x <= 180.
  if (dragAngle > 180) {
    dragAngle = dragAngle - 360;
  } else if (dragAngle < -180) {
    dragAngle = dragAngle + 360;
  }

  nutPath.attr(
    "transform",
    "rotate(" + dragAngle + "," + NUT_CENTER + "," + NUT_CENTER + ") " + TRANSLATE_STRING
  );
}

function nut(data) {
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

var adjustmentAngle = 0;
var dragAngle = 0;
var lastDraggedAngle = 0;
var drag = d3.behavior.drag()
             .on("drag", dragged);
var svg = d3.select("svg")
            .call(drag)
            .on("mouseup", function() {
              lastDraggedAngle = dragAngle;
            })
            .on("mousedown", function() {
              // Account for the difference between where we last saw a mouseup and where we're
              // starting a drag now -- otherwise the nut will jump from its last rotated-to angle.
              adjustmentAngle = (
                lastDraggedAngle -
                toDegrees(angleTo(d3.event.x, d3.event.y, NUT_CENTER, NUT_CENTER)) *
                -1
              );
            });

var nutPath = svg.append("path")
                 .datum({radius: NUT_RADIUS, centerRadius: NUT_CENTER_RADIUS})
                 .attr("d", nut)
                 .attr("transform", TRANSLATE_STRING);
