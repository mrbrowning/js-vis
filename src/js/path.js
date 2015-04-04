var _ = require('underscore');

function Nut() {
  this.centerX = this.centerY = 200;
  this.radius = 100;
  this.centerRadius = 50;

  this.adjustmentAngle = 0;
  this.angle = 0;
}

Nut.prototype.control=function(mouseX, mouseY) {
  this.controlFunc(mouseX, mouseY);
}

Nut.prototype.draw=function() {
  this.context.attr(
    "transform",
    (
      "rotate(" + this.angle + ", " + this.centerX + ", " + this.centerY + ")" +
      "translate(" + this.centerX + ", " + this.centerY + ")"
    )
  );
}

Nut.prototype.getPath=function() {
  var _this = this,
      arcRadius = _this.centerRadius / 2,
      path = [],
      vertices = _this.getVertices(true);

  path.push("M", vertices[0][0], ",", vertices[0][1]);
  path.push.apply(path, _.map(vertices.slice(1), function(v) {
    return "L" + v[0] + "," + v[1];
  }));

  path.push("Z");
  path.push("M0," + _this.centerRadius);
  path.push("A" + arcRadius + "," + arcRadius + " 0 0,0 0,-" + _this.centerRadius);
  path.push("A" + arcRadius + "," + arcRadius + " 0 0,0 0," + _this.centerRadius);

  return path.join("");
}

Nut.prototype.getVertices=function(isCanonical) {
  var _this = this;
  return _.map(_.range(6), function(i) {
    var angle, translateX, translateY;

    if (isCanonical) {
      angle = translateX = translateY = 0;
    } else {
      angle = toRadians(_this.angle);
      translateX = _this.centerX;
      translateY = _this.centerY;
    }

    var x = _this.radius * Math.cos(Math.PI * i / 3 + angle) + translateX,
        y = _this.radius * Math.sin(Math.PI * i / 3 + angle) + translateY;

    return [x, y];
  });
}

Nut.prototype.initControl=function(mouseX, mouseY, shiftKey) {
  if (shiftKey) {
    this.controlFunc = this.translate;
    this.adjustmentTranslation = [-(mouseX - this.centerX), -(mouseY - this.centerY)];
  } else {
    this.controlFunc = this.rotate;
    this.adjustmentAngle = (
      this.angle + toDegrees(angleTo(mouseX, mouseY, this.centerX, this.centerY))
    );
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
  this.angle = dragAngle;
  this.draw();
}

Nut.prototype.shouldTranslate=function(mouseX, mouseY) {
  var distanceX = mouseX - this.centerX;
  var distanceY = mouseY - this.centerY;

  return Math.sqrt(distanceX * distanceX + distanceY * distanceY) < this.centerRadius;
}

Nut.prototype.translate=function(mouseX, mouseY) {
  this.centerX = mouseX + this.adjustmentTranslation[0];
  this.centerY = mouseY + this.adjustmentTranslation[1];
  this.draw();
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
                            .attr("id", nutCount.toString())
                            .attr("d", this.nut.getPath())
                            .attr(
                              "transform",
                              "translate(" + this.nut.centerX  + ", " + this.nut.centerY + ")"
                            );
  console.log("count", nutCount);
  nutCount++;

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

function toRadians(angle) {
  return angle * Math.PI / 180;
}

var nutList = [];
var nutCount = 0;

var drag = d3.behavior.drag()
             .on("drag", function() {
               nutList[parseInt(this.id)].control(d3.event.x, d3.event.y);
             });
var svg = d3.select("svg");

nutList.push(
  (new NutBuilder()).setCenter(400, 200).setContext(svg).build(),
  (new NutBuilder()).setCenter(700, 200).setContext(svg).build()
);

var nuts = svg.selectAll("path")
              .on("mousedown", function() {
                nutList[parseInt(this.id)].initControl(d3.event.x, d3.event.y, d3.event.shiftKey);
              })
              .call(drag);
