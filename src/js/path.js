var _ = require('underscore');

function Nut() {
  this.centerX = this.centerY = 200;
  this.radius = 100;
  this.centerRadius = 50;

  this.adjustmentAngle = 0;
}

Nut.prototype.getPath=function() {
  var _this = this,
      arcRadius = _this.centerRadius / 2,
      path = [],
      x = _this.radius,
      y = 0;

  path.push("M", x, ",", y);

  path.push.apply(path, _.map(_.range(1, 6), function(i) {
    x = _this.radius * Math.cos(Math.PI * i / 3);
    y = _this.radius * Math.sin(Math.PI * i / 3);

    return "L" + x + "," + y;
  }));

  path.push("Z");
  path.push("M0," + _this.centerRadius);
  path.push("A" + arcRadius + "," + arcRadius + " 0 0,0 0,-" + _this.centerRadius);
  path.push("A" + arcRadius + "," + arcRadius + " 0 0,0 0," + _this.centerRadius);

  return path.join("");
}

Nut.prototype.initRotation=function(mouseX, mouseY) {
  if (this.hasOwnProperty('lastDraggedAngle')) {
    this.adjustmentAngle = (
      this.lastDraggedAngle + toDegrees(angleTo(mouseX, mouseY, this.centerX, this.centerY))
    );
  } else {
    this.adjustmentAngle = 0; 
  }
};

Nut.prototype.rotate=function(mouseX, mouseY) {
  var dragAngle = (
    toDegrees(angleTo(mouseX, mouseY, this.centerX, this.centerY)) * -1 + this.adjustmentAngle
  );

  // Normalize the angle so that it remains in the range -180 <= x <= 180.
  if (dragAngle > 180) {
    dragAngle = dragAngle - 360;
  } else if (dragAngle < -180) {
    dragAngle = dragAngle + 360;
  }
  this.lastDraggedAngle = dragAngle;

  this.context.attr(
    "transform",
    (
      "rotate(" + dragAngle + "," + this.centerX + "," + this.centerY + ") translate(" +
      this.centerX + ", " + this.centerY + ")"
    )
  );
}

function NutBuilder() {
  this.nut = new Nut();
};

NutBuilder.prototype.build=function() {
  return this.nut;
}

NutBuilder.prototype.setCenter=function(x, y) {
  this.nut.centerX = x;
  this.nut.centerY = y;

  return this;
}

NutBuilder.prototype.setCenterRadius=function(r) {
  this.nut.centerRadius = r;

  return this;
}

NutBuilder.prototype.setContext=function(context) {
  this.nut.context = context.append("path")
                            .attr("d", this.nut.getPath())
                            .attr(
                              "transform",
                              "translate(" + this.nut.centerX  + ", " + this.nut.centerY + ")"
                            );
  return this;
}

NutBuilder.prototype.setRadius=function(r) {
  this.nut.radius = r;

  return this;
}

function angleTo(angleX, angleY, centerX, centerY) {
  return Math.atan2(angleX - centerX, angleY - centerY);
}

function toDegrees(angle) {
  return angle / Math.PI * 180;
}

var nutList = [];

var drag = d3.behavior.drag()
             .on("drag", function() {
               _.map(nutList, function(n) {
                 n.rotate(d3.event.x, d3.event.y);
               });
             });
var svg = d3.select("svg")
            .on("mousedown", function() {
              _.map(nutList, function(n) { 
                n.initRotation(d3.event.x, d3.event.y);
              });
            })
            .call(drag);

nutList.push((new NutBuilder()).setCenter(400, 200).setContext(svg).build());
