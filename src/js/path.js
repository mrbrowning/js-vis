var _ = require('underscore');

function Nut() {
  this.centerX = this.centerY = 200;
  this.radius = 100;
  this.centerRadius = 50;

  this.color = "#ee0";

  this.adjustmentAngle = 0;
  this.angle = 0;
}

Nut.prototype.control=function(mouseX, mouseY) {
  this.controlFunc(mouseX, mouseY);
};

Nut.prototype.draw=function() {
  this.context.attr(
    "transform",
    (
      "rotate(" + this.angle + ", " + this.centerX + ", " + this.centerY + ")" +
      "translate(" + this.centerX + ", " + this.centerY + ")"
    )
  );
};

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
};

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
};

Nut.prototype.initControl=function(mouseX, mouseY, shiftKey) {
  if (shiftKey) {
    this.controlFunc = this.rotate;
    this.adjustmentAngle = (
      this.angle + toDegrees(angleTo(mouseX, mouseY, this.centerX, this.centerY))
    );
  } else {
    this.controlFunc = this.translate;
    this.adjustmentTranslation = [-(mouseX - this.centerX), -(mouseY - this.centerY)];
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
};

Nut.prototype.shouldTranslate=function(mouseX, mouseY) {
  var distanceX = mouseX - this.centerX;
  var distanceY = mouseY - this.centerY;

  return Math.sqrt(distanceX * distanceX + distanceY * distanceY) < this.centerRadius;
};

Nut.prototype.translate=function(mouseX, mouseY) {
  this.centerX = mouseX + this.adjustmentTranslation[0];
  this.centerY = mouseY + this.adjustmentTranslation[1];
  this.draw();
};

function NutBuilder() {
  this.nut = new Nut();
}

NutBuilder.prototype.build=function() {
  return this.nut;
};

NutBuilder.prototype.setCenter=function(x, y) {
  this.nut.centerX = x;
  this.nut.centerY = y;

  return this;
};

NutBuilder.prototype.setCenterRadius=function(r) {
  this.nut.centerRadius = r;

  return this;
};

NutBuilder.prototype.setColor=function(c) {
  this.nut.color = c;

  return this;
};

NutBuilder.prototype.setContext=function(context) {
  this.nut.context = context.append("path")
                            .attr("id", nutCount.toString())
                            .attr("d", this.nut.getPath())
                            .style("fill", this.nut.color)
                            .attr(
                              "transform",
                              "translate(" + this.nut.centerX  + ", " + this.nut.centerY + ")"
                            );
  nutCount++;

  return this;
};

NutBuilder.prototype.setRadius=function(r) {
  this.nut.radius = r;

  return this;
};

function angleTo(angleX, angleY, centerX, centerY) {
  return Math.atan2(angleX - centerX, angleY - centerY);
}

function formatColor(r, g, b) {
  return "rgb(" + r + ", " + g + ", " + b + ")";
}

function toDegrees(angle) {
  return angle / Math.PI * 180;
}

function toRadians(angle) {
  return angle * Math.PI / 180;
}

window.onload=function() {
  nutList = [];
  nutCount = 0;

  var svg = d3.select("svg");
  var svgWidth = svg.property("width").baseVal.value;
  var svgHeight = svg.property("height").baseVal.value;
  var svgRect = document.getElementsByTagName("div")[0].getBoundingClientRect();
  var svgTop = svgRect.top;
  var svgLeft = svgRect.left;

  var drag = d3.behavior.drag()
               .on("drag", function() {
                 // Firefox wants .x for drag events (even wrapped by D3...) and good old .clientX
                 // for regular mouse events.
                 var x = d3.event.x || d3.event.clientX;
                 var y = d3.event.y || d3.event.clientY;
                 nutList[parseInt(this.id)].control(d3.event.x, d3.event.y);
               });
  var mousedown = function() {
    var x = d3.event.x || d3.event.clientX;
    var y = d3.event.y || d3.event.clientY;
    x = x - svgLeft + window.scrollX;
    y = y - svgTop + window.scrollY;

    nutList[parseInt(this.id)].initControl(x, y, d3.event.shiftKey);
  }

  nutList.push((new NutBuilder()).setCenter(400, 200).setContext(svg).build());

  var nuts = svg.selectAll("path")
                .on("mousedown", mousedown)
                .call(drag);

  document.getElementById("addnut").onclick = function() {
    var radius = 100,
        x = Math.floor(Math.random() * (svgWidth - 2 * radius) + radius),
        y = Math.floor(Math.random() * (svgHeight - 2 * radius) + radius),
        r = Math.floor(Math.random() * 256),
        g = Math.floor(Math.random() * 256),
        b = Math.floor(Math.random() * 256);

    nutList.push(
      (new NutBuilder()).setCenter(x, y).setColor(formatColor(r, g, b)).setContext(svg).build()
    );

    nuts = svg.selectAll("path")
              .on("mousedown", mousedown)
              .call(drag);
  };
};
