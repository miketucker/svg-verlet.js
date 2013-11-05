var examples = {};
var paperjs = {};
var plugins = {};
var svg = {};
var util = {};
var verlet = {};

/*

	VerletStick: This class maintains the distances between two points
	
	There are 3 states of a stick:
	1) Free floating: Each point responds to constraint
	2) Point A or B is locked, and the respective point responds to constraint
	3) Both points are locked, in which case neither moves

	TODO: Clean up the duplicate function for locked A vs B
*/

var BaseScene, RAD_2_DEG, improvedNoise, lastUpdate,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

verlet.Stick = (function() {

  function Stick(a, b) {
    var dx, dy,
      _this = this;
    this.pointa = a;
    this.pointb = b;
    this.torn = false;
    this.tearResist = 9999;
    dx = a.x - b.x;
    dy = a.y - b.y;
    this.hypotenuse = Math.sqrt(dx * dx + dy * dy);
    if (this.pointa.locked && this.pointb.locked) {
      this.contract(function() {
        return null;
      });
    } else if (this.pointa.locked) {
      this.contract = function() {
        var diff, h, offx, offy;
        dx = _this.pointb.x - _this.pointa.x;
        dy = _this.pointb.y - _this.pointa.y;
        h = Math.sqrt(dx * dx + dy * dy);
        if (h > _this.tearResist) {
          _this.torn = true;
        }
        diff = _this.hypotenuse - h;
        offx = diff * dx / h;
        offy = diff * dy / h;
        _this.pointb.x += offx;
        _this.pointb.y += offy;
        return null;
      };
    } else if (this.pointb.locked) {
      this.contract = function() {
        var diff, h, offx, offy;
        dx = _this.pointb.x - _this.pointa.x;
        dy = _this.pointb.y - _this.pointa.y;
        h = Math.sqrt(dx * dx + dy * dy);
        if (h > _this.tearResist) {
          _this.torn = true;
        }
        diff = _this.hypotenuse - h;
        offx = diff * dx / h;
        offy = diff * dy / h;
        _this.pointa.x -= offx;
        _this.pointa.y -= offy;
        return null;
      };
    } else {
      this.contract = function() {
        var diff, h, offx, offy;
        dx = _this.pointb.x - _this.pointa.x;
        dy = _this.pointb.y - _this.pointa.y;
        h = Math.sqrt(dx * dx + dy * dy);
        if (h > _this.tearResist) {
          _this.torn = true;
        }
        diff = _this.hypotenuse - h;
        offx = (diff * dx / h) * .5;
        offy = (diff * dy / h) * .5;
        _this.pointa.x -= offx;
        _this.pointa.y -= offy;
        _this.pointb.x += offx;
        _this.pointb.y += offy;
        return null;
      };
    }
  }

  return Stick;

})();

/*

	Improved Noise: fast noise filter

	Source: http://mrl.nyu.edu/~perlin/noise/
*/


util.ImprovedNoise = (function() {
  var fade, grad, i, lerp, p;

  function ImprovedNoise() {}

  fade = function(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  };

  lerp = function(t, a, b) {
    return a + t * (b - a);
  };

  grad = function(hash, x, y, z) {
    var h, u, v;
    h = hash & 15;
    u = (h < 8 ? x : y);
    v = (h < 4 ? y : (h === 12 || h === 14 ? x : z));
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  };

  p = [151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180];

  i = 0;

  while (i < 256) {
    p[256 + i] = p[i];
    i++;
  }

  ImprovedNoise.prototype.noise = function(x, y, z) {
    var A, AA, AB, B, BA, BB, X, Y, Z, floorX, floorY, floorZ, u, v, w, xMinus1, yMinus1, zMinus1;
    floorX = ~~x;
    floorY = ~~y;
    floorZ = ~~z;
    X = floorX & 255;
    Y = floorY & 255;
    Z = floorZ & 255;
    x -= floorX;
    y -= floorY;
    z -= floorZ;
    xMinus1 = x - 1;
    yMinus1 = y - 1;
    zMinus1 = z - 1;
    u = fade(x);
    v = fade(y);
    w = fade(z);
    A = p[X] + Y;
    AA = p[A] + Z;
    AB = p[A + 1] + Z;
    B = p[X + 1] + Y;
    BA = p[B] + Z;
    BB = p[B + 1] + Z;
    return lerp(w, lerp(v, lerp(u, grad(p[AA], x, y, z), grad(p[BA], xMinus1, y, z)), lerp(u, grad(p[AB], x, yMinus1, z), grad(p[BB], xMinus1, yMinus1, z))), lerp(v, lerp(u, grad(p[AA + 1], x, y, zMinus1), grad(p[BA + 1], xMinus1, y, z - 1)), lerp(u, grad(p[AB + 1], x, yMinus1, zMinus1), grad(p[BB + 1], xMinus1, yMinus1, zMinus1))));
  };

  return ImprovedNoise;

})();

improvedNoise = new util.ImprovedNoise();

/*

	BaseScene: Base class that is extended by SvgScene and PaperScene
*/


BaseScene = (function() {

  BaseScene.prototype.isLoaded = false;

  BaseScene.prototype.isPlaying = false;

  BaseScene.prototype.dom = null;

  BaseScene.prototype.options = {
    container: "#container",
    verticalAlign: "center",
    horizontalAlign: "center",
    callback: null,
    file: null,
    parseColors: {
      lock: "#FF0000",
      link: "#FF0000"
    }
  };

  BaseScene.prototype.snapDist = 1.0;

  BaseScene.prototype.lastFrameTime = 0.0;

  BaseScene.currentTimeStep = 0.0;

  function BaseScene(options) {
    this.addStatic = __bind(this.addStatic, this);

    this.addElementPoint = __bind(this.addElementPoint, this);

    this.addLock = __bind(this.addLock, this);

    this.update = __bind(this.update, this);

    this.play = __bind(this.play, this);

    this.unload = __bind(this.unload, this);

    this.pause = __bind(this.pause, this);
    BaseScene.currentTimeStep = 0.0;
    this.options.container = "#container";
    this.options.verticalAlign = "center";
    this.options.horizontalAlign = "center";
    this.offsetY = 0;
    this.offsetX = 0;
    this.currentTimeStep = 0;
    this.points = [];
    this.sticks = [];
    this.stickLinks = [];
    this.elementPoints = [];
    this.statics = [];
    this.updates = [];
    this.plugins = [];
    this.quadTree = new util.QuadTree();
    this.isPlaying = true;
    return this;
  }

  BaseScene.prototype.pause = function() {
    return this.isPlaying = false;
  };

  BaseScene.prototype.unload = function() {
    var p, _i, _len, _ref;
    this.isPlaying = false;
    _ref = this.plugins;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      p = _ref[_i];
      p.unload();
    }
    this.points = [];
    this.sticks = [];
    this.stickLinks = [];
    this.elementPoints = [];
    this.statics = [];
    this.updates = [];
    this.plugins = [];
  };

  BaseScene.prototype.play = function() {
    var p, _i, _len, _ref;
    if (this.isPlaying) {
      return;
    }
    this.isPlaying = true;
    this.lastFrameTime = new Date().getTime();
    _ref = this.points;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      p = _ref[_i];
      p.forceX = 0;
      p.forceY = 0;
    }
    if (this.isLoaded) {
      return this.update();
    }
  };

  BaseScene.prototype.onLoaded = function() {
    return this.isLoaded = true;
  };

  BaseScene.prototype.onInit = function() {
    var e, _i, _len, _ref;
    this.lastFrameTime = new Date().getTime();
    _ref = this.plugins;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      e = _ref[_i];
      e.init(this);
    }
    this.quadTree.clear();
    this.update();
  };

  BaseScene.prototype.update = function() {
    var currentTime, e, p, s, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2, _ref3, _ref4;
    currentTime = new Date().getTime();
    BaseScene.currentTimeStep = Math.min(currentTime - this.lastFrameTime, 20);
    this.lastFrameTime = currentTime;
    _ref = this.plugins;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      e = _ref[_i];
      e.update();
    }
    _ref1 = this.points;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      p = _ref1[_j];
      p.update();
    }
    _ref2 = this.sticks;
    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
      s = _ref2[_k];
      s.contract();
    }
    _ref3 = this.elementPoints;
    for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
      p = _ref3[_l];
      p.update();
    }
    _ref4 = this.stickLinks;
    for (_m = 0, _len4 = _ref4.length; _m < _len4; _m++) {
      s = _ref4[_m];
      s.update();
    }
    if (this.isPlaying) {
      window.requestAnimFrame(this.update, null);
    }
  };

  BaseScene.tick = 0;

  BaseScene.prototype.addPoint = function(x, y, kind) {
    var foundPoints, p, search;
    if (kind == null) {
      kind = null;
    }
    x = parseFloat(x);
    y = parseFloat(y);
    search = {
      x: x - this.snapDist / 2,
      y: y - this.snapDist / 2,
      width: this.snapDist,
      height: this.snapDist
    };
    foundPoints = this.quadTree.find(search);
    if (foundPoints.length > 0) {
      p = foundPoints[0].point;
    } else {
      p = this.createPoint(x, y, kind);
      this.quadTree.insert({
        x: x,
        y: y,
        point: p
      });
      this.points.push(p);
    }
    return p;
  };

  BaseScene.prototype.createPoint = function(x, y, kind) {
    var p;
    switch (kind) {
      case "rubber":
        p = new verlet.RubberPoint(x, y);
        break;
      default:
        p = new verlet.Point(x, y);
    }
    return p;
  };

  BaseScene.prototype.addLock = function(c, x, y) {
    var p;
    p = this.addPoint(x, y);
    return p.locked = true;
  };

  BaseScene.prototype.addElementPoint = function(svgPoint, ab, x, y) {};

  BaseScene.prototype.addStatic = function(c) {
    return this.statics.push(c);
  };

  BaseScene.prototype.addPlugin = function(e) {
    return this.plugins.push(e);
  };

  BaseScene.prototype.isMobile = function() {
    return navigator.userAgent.match(/Android/) || navigator.userAgent.match(/iPhone/) || navigator.userAgent.match(/iPod/) || navigator.userAgent.match(/iPad/);
  };

  return BaseScene;

})();

window.requestAnimFrame = (function() {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
    return window.setTimeout(callback, 1000 / 60);
  };
})();

/*
	
	SvgScene: Main class for parsing and setting up the necessary verlet scene

	TODO: 

	1) Restructure: Come up with better system to parse files
	Keeping objects in groups is slow and tedious... :(

	2) Remove JQuery: This doesn't need jquery, i was just lazy
*/


svg.Scene = (function(_super) {

  __extends(Scene, _super);

  Scene.prototype.isLoaded = false;

  Scene.prototype.offsetX = 0;

  Scene.prototype.offsetY = 0;

  Scene.prototype.onLoadCallback = null;

  function Scene(options) {
    this.addSvgStick = __bind(this.addSvgStick, this);

    this.addPolyStick = __bind(this.addPolyStick, this);

    this.addPathStick = __bind(this.addPathStick, this);

    this.addHiddenStick = __bind(this.addHiddenStick, this);

    this.addElementPoint = __bind(this.addElementPoint, this);

    this.addLink = __bind(this.addLink, this);

    this.parseGroup = __bind(this.parseGroup, this);

    this.parseByColors = __bind(this.parseByColors, this);

    this.parseByGroups = __bind(this.parseByGroups, this);

    this.onLoaded = __bind(this.onLoaded, this);
    Scene.__super__.constructor.call(this, options);
    util.General.copyObject(options, this.options);
    if (this.options.callback != null) {
      this.onLoadCallback = options.callback;
    }
    this.container = $(this.options.container);
    if (this.options.file) {
      this.container.load(this.options.file, this.onLoaded);
    } else {
      setTimeout(this.onLoaded, 1);
    }
    setTimeout(function() {
      return window.scrollTo(0, 1);
    }, 0);
  }

  Scene.prototype.onLoaded = function() {
    Scene.__super__.onLoaded.call(this);
    this.dom = this.svg = this.container.find("svg")[0];
    this.dom.dispatchEvent(new Event("OnSceneFileLoaded", {
      bubbles: true,
      cancelable: true
    }));
    $(this.dom).hide();
    $(this.dom).fadeIn();
    this.parseByGroups();
    this.verticalAlign(this.options.verticalAlign);
    this.horizontalAlign(this.options.horizontalAlign);
    this.dom.dispatchEvent(new Event("onSceneLoaded", {
      bubbles: true,
      cancelable: true
    }));
    if (typeof this.onLoadCallback === "function") {
      this.onLoadCallback();
    }
    return this.onInit();
  };

  Scene.prototype.verticalAlign = function(place) {
    switch (place) {
      case "center":
        this.offsetY += $(this.svg).height() * -0.5;
        break;
      case "top":
        this.offsetY = 0;
    }
    return this.updateFrameOffset();
  };

  Scene.prototype.horizontalAlign = function(place) {
    switch (place) {
      case "center":
        this.offsetX += $(this.svg).width() * -0.5;
        break;
      case "left":
        this.offsetX = 0;
    }
    return this.updateFrameOffset();
  };

  Scene.prototype.updateFrameOffset = function() {
    $(this.svg).css('marginLeft', this.offsetX);
    return $(this.svg).css('marginTop', this.offsetY);
  };

  Scene.prototype.offsetFrame = function(x, y) {
    this.offsetX += x;
    this.offsetY += y;
    return this.updateFrameOffset();
  };

  Scene.prototype.setSize = function(width, height) {
    this.svg.setAttribute("width", width);
    this.svg.setAttribute("height", height);
    return this.svg.setAttribute("viewBox", "0 0 " + width + " " + height);
  };

  Scene.prototype.parseByGroups = function() {
    var $svg, _;
    $svg = $(this.svg);
    _ = this;
    $svg.find('[id^="Statics"]').find("g").each(function() {
      return _.addStatic(this);
    });
    $svg.find('[id^="Locks"]').find("circle,ellipse").each(function() {
      _.addLock(this, this.getAttribute('cx'), this.getAttribute('cy'));
      return $(this).remove();
    });
    $svg.find('[id^="Hit"]').each(function() {
      return _.makeInvisible(this);
    });
    $svg.find('[id^="HiddenVerlets"]').find("line").each(function() {
      return _.addSvgStick(this, true);
    });
    $svg.find('[id^="HiddenVerlets"]').find("polyline").each(function() {
      return _.addPolyStick(this, false, null, true);
    });
    $svg.find('[id^="Verlets"]').find("polyline").each(function() {
      return _.addPolyStick(this);
    });
    $svg.find('[id^="Verlets"]').find("line").each(function() {
      return _.addSvgStick(this);
    });
    $svg.find('[id^="Points"]').find("polyline").each(function() {
      return _.addPolyStick(this, true);
    });
    $svg.find('[id^="Points"]').find("line").each(function() {
      return _.addSvgStick(this, false, true);
    });
    $svg.find('[id^="Points"]').find("path").each(function() {
      return _.addPathStick(this, true);
    });
    $svg.find('[id^="RubberPoints"]').find("polyline, polygon").each(function() {
      return _.addPolyStick(this, true, "rubber");
    });
    $svg.find('[id^="RubberPoints"]').find("line").each(function() {
      return _.addSvgStick(this, false, true, "rubber");
    });
    $svg.find('[id^="RubberPoints"]').find("path").each(function() {
      return _.addPathStick(this, true, "rubber");
    });
    return $svg.find('[id^="Links"]').find("line").each(function() {
      return _.addLink(this);
    });
  };

  Scene.prototype.makeInvisible = function(c) {
    return c.setAttribute("fill", "rgba(0,0,0,0)");
  };

  Scene.prototype.parseByColors = function() {
    return $(this.svg).children().each(this.parseGroup);
  };

  Scene.prototype.parseGroup = function(c) {
    var _;
    _ = this;
    return $(c).children().each(function() {
      switch (this.nodeName) {
        case "g":
          if (this.id.length > 0) {
            _.addStatic(this);
          }
          return _.parseGroup(this);
        case "circle":
          switch (this.getAttribute("fill")) {
            case _.options.parseColors.lock:
              return _.addLock(this, this.attr('cx'), this.attr('cy'));
          }
          break;
        case "line":
          switch (this.getAttribute("stroke")) {
            case _.options.parseColors.link:
              return _.addLink(this);
            default:
              return _.addSvgStick(this);
          }
      }
    });
  };

  Scene.prototype.addLink = function(c) {
    var linkName, p, p1, p2, pa, pb, s, sl, _i, _len, _ref;
    p = $(c);
    pa = this.addPoint(p.attr('x1'), p.attr('y1'));
    pb = this.addPoint(p.attr('x2'), p.attr('y2'));
    if (pb.x < pa.x) {
      p1 = pb;
      p2 = pa;
    } else {
      p1 = pa;
      p2 = pb;
    }
    this.sticks.push(sl = new svg.StickLink(p1, p2));
    this.stickLinks.push(sl);
    linkName = p[0].id.split("Link")[1];
    _ref = this.statics;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      s = _ref[_i];
      if (s.id === linkName) {
        sl.setLink(s);
        break;
      }
    }
    return p.remove();
  };

  Scene.prototype.addElementPoint = function(element, ab, x, y) {
    var p, sp;
    p = this.addPoint(x, y);
    sp = new svg.Point(element, ab, p);
    this.elementPoints.push(sp);
    return p;
  };

  Scene.prototype.addHiddenStick = function(c) {
    return this.addSvgStick(c, true);
  };

  Scene.prototype.addPathStick = function(path, skipStick, kind) {
    var i, len, nextPoint, origPoint, pAr, pathSeg, segments;
    if (skipStick == null) {
      skipStick = false;
    }
    if (kind == null) {
      kind = null;
    }
    segments = path.pathSegList;
    i = 0;
    len = segments.numberOfItems;
    pAr = [];
    while (i < len) {
      pathSeg = segments.getItem(i);
      switch (pathSeg.pathSegType) {
        case SVGPathSeg.PATHSEG_MOVETO_ABS:
          origPoint = this.addPoint(parseFloat(pathSeg.x), parseFloat(pathSeg.y), kind);
          if (pAr.length === 0) {
            pAr.push(origPoint);
          }
          break;
        case SVGPathSeg.PATHSEG_LINETO_REL:
          nextPoint = this.addPoint(parseFloat(pathSeg.x), parseFloat(pathSeg.y), kind);
          if (!skipStick) {
            this.addUniqueStick(lastPoint, nextPoint);
          }
          pAr.push(nextPoint);
      }
      ++i;
    }
    if (pAr.length > 1) {
      return this.elementPoints.push(new svg.Path(path, pAr));
    }
  };

  Scene.prototype.addPolyStick = function(polyline, skipStick, kind, remove) {
    var i, p, pAr, pointStr, pointStrAr, prevVerlet, sp, verletPoint, _i, _len;
    if (skipStick == null) {
      skipStick = false;
    }
    if (kind == null) {
      kind = null;
    }
    if (remove == null) {
      remove = false;
    }
    pointStr = polyline.getAttribute("points");
    pointStr = pointStr.replace(/(\r\n|\t|\n|\r)/gm, "");
    pointStrAr = pointStr.split(" ");
    pAr = [];
    i = 0;
    for (_i = 0, _len = pointStrAr.length; _i < _len; _i++) {
      p = pointStrAr[_i];
      sp = p.split(",");
      if (!(isNaN(sp[0]) || isNaN(sp[1]))) {
        verletPoint = this.addPoint(sp[0], sp[1], kind);
        pAr.push(verletPoint);
        if (i > 0 && !skipStick) {
          this.addUniqueStick(prevVerlet, verletPoint);
        }
        prevVerlet = verletPoint;
      }
      i++;
    }
    if (remove) {
      return $(polyline).remove();
    } else {
      return this.elementPoints.push(new svg.PolyLine(polyline, pAr));
    }
  };

  Scene.prototype.addUniqueStick = function(p1, p2) {
    var dupe, s, _i, _len, _ref;
    dupe = false;
    _ref = this.sticks;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      s = _ref[_i];
      if ((s.pointa === p1 && s.pointb === p2) || (s.pointa === p2 && s.pointb === p1) || (p1 === p2)) {
        dupe = true;
        break;
      }
    }
    if (!dupe) {
      this.sticks.push(new verlet.Stick(p1, p2));
    }
    return !dupe;
  };

  Scene.prototype.addSvgStick = function(segment, remove, skipStick, kind) {
    var p1, p2;
    if (remove == null) {
      remove = false;
    }
    if (skipStick == null) {
      skipStick = false;
    }
    if (kind == null) {
      kind = null;
    }
    p1 = this.addPoint(segment.getAttribute('x1'), segment.getAttribute('y1'), kind);
    p2 = this.addPoint(segment.getAttribute('x2'), segment.getAttribute('y2'), kind);
    if (skipStick) {
      this.elementPoints.push(new svg.Point(segment, 1, p1));
      this.elementPoints.push(new svg.Point(segment, 2, p2));
    } else if (this.addUniqueStick(p1, p2)) {
      this.elementPoints.push(new svg.Point(segment, 1, p1));
      this.elementPoints.push(new svg.Point(segment, 2, p2));
    }
    if (remove) {
      return segment.remove();
    }
  };

  return Scene;

})(BaseScene);

/*

	PaperScene: uses Canvas and Paper.js as the renderer
*/


paperjs.Scene = (function(_super) {

  __extends(Scene, _super);

  Scene.prototype.settings = {
    width: null,
    height: null,
    container: "#container",
    fullscreen: false
  };

  Scene.prototype.elements = {
    verlets: null,
    locks: null,
    winds: null,
    statics: null
  };

  function Scene(file, options) {
    var $canvas;
    if (options == null) {
      options = {};
    }
    this.onResize = __bind(this.onResize, this);

    this.update = __bind(this.update, this);

    this.addElementPoint = __bind(this.addElementPoint, this);

    this.onLoadedSVG = __bind(this.onLoadedSVG, this);

    Scene.__super__.constructor.call(this);
    if (options.width != null) {
      this.settings.width = options.width;
    }
    if (options.height != null) {
      this.settings.height = options.height;
    }
    if (this.settings.width == null) {
      this.settings.width = $(window).width();
      this.settings.fullscreen = true;
    }
    if (this.settings.height == null) {
      this.settings.height = $(window).height();
    }
    $canvas = $("<canvas width='" + this.settings.width + "' height ='" + this.settings.height + "'/>");
    $(this.settings.container).append($canvas);
    this.dom = this.canvas = $canvas[0];
    paper.setup(this.canvas);
    this.project = paper.project;
    this.view = paper.view;
    this.width = this.settings.width;
    this.height = this.settings.height;
    $.get(file, this.onLoadedSVG);
    if (this.settings.fullscreen) {
      $(window).resize(this.onResize);
    }
  }

  Scene.prototype.quadTest = function() {
    var c, i, n, o, p, ret, rx, ry, search, _i, _len;
    i = 0;
    while (i < 500) {
      o = {
        x: Math.random() * 1000,
        y: Math.random() * 1000,
        width: 1,
        height: 1
      };
      c = new paper.Path.Circle(new paper.Point(o.x, o.y), 2);
      c.fillColor = 'red';
      o.obj = c;
      this.quadTree.insert(o);
      i++;
    }
    rx = Math.random() * 500;
    ry = Math.random() * 500;
    search = {
      x: rx,
      y: rx,
      width: 10,
      height: 10
    };
    ret = this.quadTree.retrieve(search);
    p = new paper.Path.Rectangle(new paper.Point(search.x, search.y), new paper.Size(search.width, search.height));
    p.strokeColor = "red";
    for (_i = 0, _len = ret.length; _i < _len; _i++) {
      n = ret[_i];
      if (n.x >= search.x && n.y >= search.y && n.x < (search.width + search.x) && n.y < (search.height + search.y)) {
        n.obj.fillColor = 'green';
      } else {
        n.obj.fillColor = 'blue';
      }
    }
    return this.view.draw();
  };

  Scene.prototype.onLoadedSVG = function(e) {
    var svg;
    this.onLoaded();
    svg = this.project.importSVG($(e).find("svg")[0]);
    if (svg.children.Statics != null) {
      this.elements.statics = svg.children.Statics;
    }
    if (svg.children.Links != null) {
      this.elements.links = svg.children.Links;
    }
    if (svg.children.Locks != null) {
      this.elements.locks = svg.children.Locks;
    }
    if (svg.children.Wind != null) {
      this.elements.winds = svg.children.Wind;
    }
    if (svg.children.Verlets != null) {
      this.elements.verlets = svg.children.Verlets;
    }
    if (svg.children.HiddenVerlets != null) {
      this.elements.hiddenVerlets = svg.children.HiddenVerlets;
    }
    this.view.draw();
    this.initElements();
    return this.onInit();
  };

  Scene.prototype.initElements = function() {
    var c, toDispose, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n, _ref, _ref1, _ref2, _ref3, _ref4, _results;
    toDispose = [];
    _ref = this.elements.locks.children;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      c = _ref[_i];
      this.addLock(c, c.position.x, c.position.y);
      toDispose.push(c);
    }
    _ref1 = this.elements.statics.children;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      c = _ref1[_j];
      this.addStatic(c);
    }
    _ref2 = this.elements.verlets.children;
    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
      c = _ref2[_k];
      this.addStick(c);
    }
    if (this.elements.hiddenVerlets != null) {
      _ref3 = this.elements.hiddenVerlets.children;
      for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
        c = _ref3[_l];
        this.addStick(c, true);
        toDispose.push(c);
      }
    }
    if (this.elements.links != null) {
      _ref4 = this.elements.links.children;
      for (_m = 0, _len4 = _ref4.length; _m < _len4; _m++) {
        c = _ref4[_m];
        this.addLink(c);
        toDispose.push(c);
      }
    }
    _results = [];
    for (_n = 0, _len5 = toDispose.length; _n < _len5; _n++) {
      c = toDispose[_n];
      _results.push(c.remove());
    }
    return _results;
  };

  Scene.prototype.addElementPoint = function(paperPoint) {
    var p, sp;
    p = this.addPoint(paperPoint.point.x, paperPoint.point.y);
    sp = new paperjs.Point(p, paperPoint.point);
    this.elementPoints.push(sp);
    return p;
  };

  Scene.prototype.addStick = function(element, remove) {
    var p1, p2;
    switch (element.type) {
      case "path":
        if (element.segments.length > 1) {
          if (remove) {
            p1 = this.addPoint(element.segments[0].point.x, element.segments[0].point.y);
            p2 = this.addPoint(element.segments[1].point.x, element.segments[1].point.y);
          } else {
            p1 = this.addElementPoint(element.segments[0]);
            p2 = this.addElementPoint(element.segments[1]);
          }
          return this.sticks.push(new verlet.Stick(p1, p2));
        }
    }
  };

  Scene.prototype.addLink = function(element) {
    var linkName, p1, p2, pa, pb, s, sl, _i, _len, _ref;
    switch (element.type) {
      case "path":
        if (element.segments.length > 1) {
          pa = this.addPoint(element.segments[0].point.x, element.segments[0].point.y);
          pb = this.addPoint(element.segments[1].point.x, element.segments[1].point.y);
          if (pb.x < pa.x) {
            p1 = pb;
            p2 = pa;
          } else {
            p1 = pa;
            p2 = pb;
          }
          this.sticks.push(sl = new paperjs.StickLink(p1, p2));
          this.stickLinks.push(sl);
          linkName = element.name.split("Link")[1];
          _ref = this.statics;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            s = _ref[_i];
            if (s.name === linkName) {
              sl.setLink(s);
              return;
            }
          }
        }
    }
  };

  Scene.prototype.update = function() {
    Scene.__super__.update.call(this);
    return this.view.draw();
  };

  Scene.prototype.onResize = function() {
    this.canvas.setAttribute("width", window.innerWidth);
    return this.canvas.setAttribute("height", window.innerHeight);
  };

  return Scene;

})(BaseScene);

/*

	ColorPaperScene: Extends the Paperjs renderer to add random palettes.
*/


examples.ColorPaperScene = (function(_super) {

  __extends(ColorPaperScene, _super);

  function ColorPaperScene() {
    this.assignPalette = __bind(this.assignPalette, this);

    this.onLoadedSVG = __bind(this.onLoadedSVG, this);
    return ColorPaperScene.__super__.constructor.apply(this, arguments);
  }

  ColorPaperScene.prototype.settings = {
    defaultBg: "#FFFFFF",
    defaultFg: "#CCCCCC"
  };

  ColorPaperScene.prototype.onLoadedSVG = function(e) {
    this.assignPalette($(e).find("svg")[0]);
    return ColorPaperScene.__super__.onLoadedSVG.call(this, e);
  };

  ColorPaperScene.prototype.assignPalette = function(svg) {
    var bgHue, fgHue, fgSat, fgVal, isLight,
      _this = this;
    isLight = Math.random() > 0.5;
    if (isLight) {
      util.General.randomSeed = new Date().getTime() * 0.5;
      fgHue = Math.random();
      bgHue = fgHue + (Math.random() * 0.5 + 0.25);
      if (bgHue >= 1.0) {
        bgHue -= 1.0;
      }
      this.bgColor = util.Color.hsvToHex(bgHue, 0.15, 0.75);
      fgSat = Math.random() * 0.5 + 0.5;
      fgVal = 0.4 + Math.random() * 0.2;
      this.fgColor = util.Color.hsvToHex(fgHue, fgSat, fgVal);
      this.highlightColor = util.Color.hsvToHex(fgHue, fgSat, Math.min(fgVal + 0.5, 1.0));
    } else {
      fgHue = Math.random();
      bgHue = fgHue + (Math.random() * 0.5 + 0.25);
      if (bgHue >= 1.0) {
        bgHue -= 1.0;
      }
      this.bgColor = util.Color.hsvToHex(bgHue, 0.15 + Math.random() * 0.4, 0.1 + Math.random() * 0.1);
      fgSat = Math.random() * 0.1 + 0.3;
      fgVal = 0.2 + Math.random() * 0.2;
      this.highlightColor = util.Color.hsvToHex(fgHue, fgSat, fgVal);
      this.fgColor = util.Color.hsvToHex(fgHue, fgSat + 0.5, Math.min(fgVal + 0.8, 1.0));
    }
    $("html, body").css("background-color", this.bgColor);
    return $(svg).find("line, rect, circle, polygon, polyline, path").each(function(i, c) {
      var fill;
      if ($(c).attr("stroke") != null) {
        $(c).attr("stroke", _this.fgColor);
      }
      fill = $(c).attr("fill");
      if (fill === _this.settings.defaultBg) {
        return $(c).attr("fill", _this.settings.bgColor);
      } else if (fill === _this.settings.defaultFg) {
        return $(c).attr("fill", _this.highlightColor);
      }
    });
  };

  return ColorPaperScene;

})(paperjs.Scene);

/*

	ColorSvgScene: Extends SvgScene to add random palettes.
*/


examples.ColorSvgScene = (function(_super) {

  __extends(ColorSvgScene, _super);

  ColorSvgScene.prototype.settings = {
    defaultBgColor: "#FFFFFF",
    defaultFgColor: "#666666",
    defaultHighlightColor: "#CCCCCC",
    defaultSecondaryColor: "#999999"
  };

  function ColorSvgScene(options) {
    this.onLoaded = __bind(this.onLoaded, this);
    ColorSvgScene.__super__.constructor.call(this, options);
    this.generatePalette();
  }

  ColorSvgScene.prototype.onLoaded = function() {
    ColorSvgScene.__super__.onLoaded.call(this);
    return this.assignPalette();
  };

  ColorSvgScene.prototype.generatePalette = function() {
    var bgHue, fgHue, fgSat, fgVal, highlightVal, secHue, secSat;
    this.isLight = Math.random() > 0.5;
    if (this.isLight) {
      util.General.randomSeed = new Date().getTime() * 0.001;
      fgHue = util.General.randomFromSeed();
      bgHue = fgHue + (Math.random() * 0.5 + 0.25);
      if (bgHue >= 1.0) {
        bgHue -= 1.0;
      }
      fgSat = Math.random() * 0.5 + 0.5;
      fgVal = 0.5 + Math.random() * 0.2;
      this.bgColor = util.Color.hsvToHex(bgHue, Math.random() * 0.1, 0.8);
      this.fgColor = util.Color.hsvToHex(fgHue, fgSat, fgVal);
      highlightVal = Math.min(fgVal + 0.5, 1.0);
      this.highlightColor = util.Color.hsvToHex(fgHue, fgSat, highlightVal);
      secHue = fgHue + 0.1;
      if (secHue > 1.0) {
        secHue -= 1.0;
      }
      secSat = Math.min(fgVal + Math.random() * 0.4, 1.0);
      return this.secondaryColor = util.Color.hsvToHex(secHue, secSat, highlightVal);
    } else {
      util.General.randomSeed = new Date().getTime() * 0.5;
      fgHue = util.General.randomFromSeed();
      bgHue = fgHue + (Math.random() * 0.5 + 0.25);
      if (bgHue >= 1.0) {
        bgHue -= 1.0;
      }
      this.bgColor = util.Color.hsvToHex(bgHue, 0.15 + Math.random() * 0.2, 0.1 + Math.random() * 0.1);
      fgSat = Math.random() * 0.5 + 0.3;
      fgVal = 0.7 + Math.random() * 0.3;
      this.fgColor = util.Color.hsvToHex(fgHue, fgSat, fgVal);
      highlightVal = Math.min(fgVal - 0.4, 1.0);
      this.highlightColor = util.Color.hsvToHex(fgHue, fgSat, highlightVal);
      secHue = fgHue + 0.2;
      if (secHue > 1.0) {
        secHue -= 1.0;
      }
      secSat = Math.min(fgSat + Math.random() * 0.4, 1.0);
      return this.secondaryColor = util.Color.hsvToHex(secHue, secSat, fgVal);
    }
  };

  ColorSvgScene.prototype.assignPalette = function() {
    var _this = this;
    return $(this.svg).find("line, rect, circle, polygon, polyline, path").each(function(i, c) {
      var fill, stroke;
      stroke = $(c).attr("stroke");
      fill = $(c).attr("fill");
      switch (stroke) {
        case _this.settings.defaultFgColor:
          $(c).attr("stroke", _this.fgColor);
          break;
        case _this.settings.defaultBgColor:
          $(c).attr("stroke", _this.bgColor);
          break;
        case _this.settings.defaultHighlightColor:
          $(c).attr("stroke", _this.highlightColor);
          break;
        case _this.settings.defaultSecondaryColor:
          $(c).attr("stroke", _this.secondaryColor);
      }
      switch (fill) {
        case _this.settings.defaultFgColor:
          return $(c).attr("fill", _this.fgColor);
        case _this.settings.defaultBgColor:
          return $(c).attr("fill", _this.bgColor);
        case _this.settings.defaultHighlightColor:
          return $(c).attr("fill", _this.highlightColor);
        case _this.settings.defaultSecondaryColor:
          return $(c).attr("fill", _this.secondaryColor);
      }
    });
  };

  return ColorSvgScene;

})(svg.Scene);

/*

	GenerativeSvgScene: Extends the ColorSVGScene, and generates new elements procedurally
*/


examples.GenerativeSvgScene = (function(_super) {

  __extends(GenerativeSvgScene, _super);

  function GenerativeSvgScene() {
    this.addNewElements = __bind(this.addNewElements, this);

    this.onLoaded = __bind(this.onLoaded, this);
    return GenerativeSvgScene.__super__.constructor.apply(this, arguments);
  }

  GenerativeSvgScene.prototype.onLoaded = function() {
    this.svg = this.container.find("svg")[0];
    this.addNewElements();
    return GenerativeSvgScene.__super__.onLoaded.call(this);
  };

  GenerativeSvgScene.prototype.addNewElements = function() {
    var $dupeLines, $dupeLock, $dupeWind, $lockGroup, $newLock, $newWind, $verletGroup, $windGroup, baseLineX, baseLineY, dist, i, j, l, nl, nx, ny, radian, radius, ringCount, ringLayerDistance, ringPointCount, sizePadding, sx, sy, windOffsetX, windOffsetY, _i, _j, _len;
    $verletGroup = $(this.svg).find("#Verlets");
    $lockGroup = $(this.svg).find("#Locks");
    $windGroup = $(this.svg).find("#Wind");
    $dupeLines = $(this.svg).find("#Verlets line");
    $dupeLock = $lockGroup.find("circle");
    $dupeWind = $windGroup.find("circle");
    sizePadding = 100;
    ringCount = 4;
    ringLayerDistance = 60.0;
    radius = ringCount * ringLayerDistance + sizePadding;
    this.setSize(radius * 2, radius * 2);
    sx = radius;
    sy = radius;
    windOffsetX = parseFloat($dupeWind.attr("cx")) - parseFloat($dupeLock.attr("cx"));
    windOffsetY = parseFloat($dupeWind.attr("cy")) - parseFloat($dupeLock.attr("cy"));
    for (i = _i = 0; 0 <= ringCount ? _i <= ringCount : _i >= ringCount; i = 0 <= ringCount ? ++_i : --_i) {
      ringPointCount = i * 4 + 1;
      j = 0;
      dist = i * ringLayerDistance;
      while (j < ringPointCount) {
        radian = (Math.PI * 2.0) * j / ringPointCount;
        nx = sx + Math.cos(radian) * dist;
        ny = sy + Math.sin(radian) * dist;
        $newLock = $dupeLock.clone();
        $lockGroup.append($newLock);
        this.assignCirclePosition($newLock, nx, ny);
        $newWind = $dupeWind.clone();
        $windGroup.append($newWind);
        this.assignCirclePosition($newWind, nx + windOffsetX, ny + windOffsetY);
        baseLineX = parseFloat($($dupeLines[0]).attr("x1"));
        baseLineY = parseFloat($($dupeLines[0]).attr("y1"));
        for (_j = 0, _len = $dupeLines.length; _j < _len; _j++) {
          l = $dupeLines[_j];
          nl = $(l).clone();
          $verletGroup.append(nl);
          this.offsetLinePosition(nl, -baseLineX + nx, -baseLineY + ny);
        }
        j++;
      }
    }
    $dupeLines.remove();
    $dupeWind.remove();
    return $dupeLock.remove();
  };

  GenerativeSvgScene.prototype.assignCirclePosition = function(circle, x, y) {
    circle.attr("cx", x);
    return circle.attr("cy", y);
  };

  GenerativeSvgScene.prototype.offsetLinePosition = function(line, offsetX, offsetY) {
    line.attr("x1", parseFloat(line.attr("x1")) + offsetX);
    line.attr("y1", parseFloat(line.attr("y1")) + offsetY);
    line.attr("x2", parseFloat(line.attr("x2")) + offsetX);
    return line.attr("y2", parseFloat(line.attr("y2")) + offsetY);
  };

  return GenerativeSvgScene;

})(examples.ColorSvgScene);

/*

	PaperJS Point: simply updates the paper point from the verlet info

	TODO:
*/


paperjs.Point = (function() {

  function Point(verletPoint, paperPoint) {
    this.verletPoint = verletPoint;
    this.paperPoint = paperPoint;
  }

  Point.prototype.update = function() {
    this.paperPoint.x = this.verletPoint.x;
    return this.paperPoint.y = this.verletPoint.y;
  };

  return Point;

})();

paperjs.StickLink = (function(_super) {

  __extends(StickLink, _super);

  function StickLink() {
    return StickLink.__super__.constructor.apply(this, arguments);
  }

  StickLink.prototype.rotation = 0;

  StickLink.prototype.link = null;

  StickLink.prototype.offset = null;

  StickLink.prototype.update = function() {
    var deltaRotation, rot;
    rot = Math.atan2(this.pointb.y - this.pointa.y, this.pointb.x - this.pointa.x) * RAD_2_DEG;
    deltaRotation = rot - this.rotation;
    this.rotation = rot;
    this.group.position = this.pointa;
    this.group.position.x -= this.c.position.x - this.pointa.x;
    this.group.position.y -= this.c.position.y - this.pointa.y;
    return this.group.rotate(deltaRotation, this.pointa);
  };

  StickLink.prototype.setLink = function(l) {
    this.group = new paper.Group();
    this.c = new paper.Group();
    this.c.position = this.pointa;
    this.link = l;
    this.group.addChild(l);
    this.group.addChild(this.c);
    this.link.position.x += 1;
    return this.link.position.y += 1;
  };

  return StickLink;

})(verlet.Stick);

/*
	
	BasePlugin: Basic interface of a plugin
*/


plugins.BasePlugin = (function() {

  function BasePlugin() {}

  BasePlugin.prototype.init = function(scene) {
    this.scene = scene;
  };

  BasePlugin.prototype.update = function() {};

  BasePlugin.prototype.unload = function() {};

  return BasePlugin;

})();

/*
	
	VerletGravity: Applies a simple directional force to each point.

	If @useMobileTilt is enabled, the gyroscope data from the device will be used to determine the "down" direction
*/


plugins.Gravity = (function(_super) {

  __extends(Gravity, _super);

  Gravity.prototype.x = 0;

  Gravity.prototype.y = 0.02;

  Gravity.prototype.points = null;

  Gravity.prototype.useMobileTilt = true;

  Gravity.prototype.mobileAmplitude = 0.1;

  function Gravity(y, x, useMobileTilt) {
    this.useMobileTilt = useMobileTilt != null ? useMobileTilt : true;
    this.update = __bind(this.update, this);

    this.init = __bind(this.init, this);

    if (y != null) {
      this.y = y;
    }
    if (x != null) {
      this.x = x;
    }
  }

  Gravity.prototype.init = function(scene) {
    var mobileX, mobileY, p, _i, _len, _ref,
      _this = this;
    this.scene = scene;
    this.points = [];
    _ref = this.scene.points;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      p = _ref[_i];
      if (!p.locked) {
        this.points.push(p);
      }
    }
    if (this.useMobileTilt && this.scene.isMobile()) {
      mobileY = -this.mobileAmplitude * this.y;
      if (this.x === 0) {
        mobileX = -mobileY;
      } else {
        mobileX = this.mobileAmplitude * this.x;
      }
      return window.ondevicemotion = function(e) {
        _this.x = parseFloat(e.accelerationIncludingGravity.x) * mobileX;
        return _this.y = parseFloat(e.accelerationIncludingGravity.y) * mobileY;
      };
    }
  };

  Gravity.prototype.update = function() {
    var p, timeStep, x, y, _i, _len, _ref, _results;
    timeStep = BaseScene.currentTimeStep;
    x = this.x * timeStep;
    y = this.y * timeStep;
    _ref = this.points;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      p = _ref[_i];
      _results.push(p.force(x, y));
    }
    return _results;
  };

  return Gravity;

})(plugins.BasePlugin);

/*
	
	VerletMousePull: Applies a radial gravity towards the mouse (or touch input) to each point
*/


lastUpdate = 0.0;

plugins.MousePull = (function(_super) {

  __extends(MousePull, _super);

  MousePull.prototype.mouse = {
    x: -9999,
    y: -9999,
    down: 0
  };

  MousePull.prototype.strength = 0.004;

  MousePull.prototype.downStrength = 0.01;

  MousePull.prototype.svg = null;

  MousePull.prototype.scene = null;

  MousePull.prototype.points = null;

  MousePull.offsetX = 0;

  MousePull.offsetY = 0;

  function MousePull(strength, mouseDownStrength) {
    this.update = __bind(this.update, this);

    this.onTouchMove = __bind(this.onTouchMove, this);

    this.onMouseMove = __bind(this.onMouseMove, this);

    this.onMouseUp = __bind(this.onMouseUp, this);

    this.onMouseDown = __bind(this.onMouseDown, this);

    this.initDesktop = __bind(this.initDesktop, this);

    this.onTouchMove = __bind(this.onTouchMove, this);

    this.onTouchStart = __bind(this.onTouchStart, this);

    this.initMobile = __bind(this.initMobile, this);

    this.onResize = __bind(this.onResize, this);

    this.unload = __bind(this.unload, this);
    if (strength != null) {
      this.strength = strength;
    }
    if (mouseDownStrength != null) {
      this.downStrength = mouseDownStrength;
    }
  }

  MousePull.prototype.init = function(scene) {
    var p, _i, _len, _ref;
    this.scene = scene;
    this.dom = this.scene.dom;
    this.mouse.down = 0;
    this.points = [];
    _ref = this.scene.points;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      p = _ref[_i];
      if (!p.locked) {
        this.points.push(p);
      }
    }
    if (this.scene.isMobile()) {
      this.initMobile();
    } else {
      this.initDesktop();
    }
    $(window).resize(this.onResize);
    this.scene.dom.addEventListener("onSceneLoaded", this.onResize);
    return this.onResize();
  };

  MousePull.prototype.unload = function() {
    $(window).unbind("resize", this.onResize);
    this.scene.dom.removeEventListener("onSceneLoaded", this.onResize);
    document.removeEventListener("touchmove", this.onTouchMove);
    document.removeEventListener("touchend", this.onTouchEnd);
    document.removeEventListener("touchstart", this.onTouchStart);
    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("mousedown", this.onMouseDown);
    return document.removeEventListener("mouseup", this.onMouseUp);
  };

  MousePull.prototype.onResize = function() {
    var wh, ww;
    ww = $(window).width();
    wh = $(window).height();
    this.offsetX = $(this.dom).offset().left;
    return this.offsetY = $(this.dom).offset().top;
  };

  MousePull.prototype.initMobile = function() {
    document.addEventListener("touchmove", this.onTouchMove);
    document.addEventListener("touchend", this.onTouchEnd);
    return document.addEventListener("touchstart", this.onTouchStart);
  };

  MousePull.prototype.onTouchStart = function() {
    return this.mouse.down = 1;
  };

  MousePull.prototype.onTouchMove = function() {
    this.mouse.down = 0;
    this.mouse.x = -9999;
    return this.mouse.y = -9999;
  };

  MousePull.prototype.initDesktop = function() {
    this.mouse.down = 1;
    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("mousedown", this.onMouseDown);
    return document.addEventListener("mouseup", this.onMouseUp);
  };

  MousePull.prototype.onMouseDown = function() {
    return this.mouse.down = 2;
  };

  MousePull.prototype.onMouseUp = function() {
    return this.mouse.down = 1;
  };

  MousePull.prototype.onMouseMove = function(e) {
    this.offsetX = $(this.dom).offset().left;
    this.offsetY = $(this.dom).offset().top;
    this.mouse.x = e.pageX - this.offsetX;
    return this.mouse.y = e.pageY - this.offsetY;
  };

  MousePull.prototype.onTouchMove = function(e) {
    this.offsetX = $(this.dom).offset().left;
    this.offsetY = $(this.dom).offset().top;
    this.mouse.x = e.touches[0].pageX - this.offsetX;
    this.mouse.y = e.touches[0].pageY - this.offsetY;
    e.preventDefault();
    return null;
  };

  MousePull.prototype.update = function() {
    var amt, dx, dy, mx, my, p, _i, _len, _ref, _results;
    if (this.mouse.down < 1) {
      return;
    }
    amt = (this.mouse.down > 1 ? this.downStrength : this.strength);
    amt *= BaseScene.currentTimeStep * 0.1;
    mx = this.mouse.x;
    my = this.mouse.y;
    _ref = this.points;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      p = _ref[_i];
      dx = p.x - mx;
      dy = p.y - my;
      if (dx * dx + dy * dy < 10000) {
        _results.push(p.force((mx - p.x) * amt, (my - p.y) * amt));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  return MousePull;

})(plugins.BasePlugin);

/* 

	NoiseWarp: Applies a turbulance force
*/


plugins.NoiseWarp = (function(_super) {

  __extends(NoiseWarp, _super);

  NoiseWarp.prototype.speed = 0.01;

  NoiseWarp.prototype.zoom = 0.002;

  NoiseWarp.prototype.strength = 0.1;

  NoiseWarp.prototype.offsetX = 1.0;

  NoiseWarp.prototype.offsetY = 1.0;

  NoiseWarp.prototype.offsetZ = 2.0;

  NoiseWarp.prototype.skip = 0;

  function NoiseWarp() {}

  NoiseWarp.prototype.init = function(scene) {
    var p, _, _i, _len, _ref;
    this.scene = scene;
    _ = this;
    _ref = this.scene.points;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      p = _ref[_i];
      p.warpDampen = Math.max(improvedNoise.noise(p.x * 0.1, p.y * 0.1, 1.0) * 0.2 + 0.1, 0.01);
    }
    return this.update = function() {
      var currentStrength, _j, _k, _len1, _len2, _ref1, _ref2, _results;
      currentStrength = this.strength;
      _ref1 = this.scene.points;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        p = _ref1[_j];
        p.x += ((p.originalX + improvedNoise.noise(p.x * this.zoom + this.offsetX, p.y * this.zoom + this.offsetY, this.offsetZ) * currentStrength) - p.x) * p.warpDampen;
        p.y += ((p.originalY + improvedNoise.noise(p.x * this.zoom + 1.0 + this.offsetX, p.y * this.zoom + this.offsetY, this.offsetZ) * currentStrength) - p.y) * p.warpDampen;
      }
      this.offsetZ += this.speed;
      _ref2 = this.scene.elementPoints;
      _results = [];
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        p = _ref2[_k];
        _results.push(p.update());
      }
      return _results;
    };
  };

  return NoiseWarp;

})(plugins.BasePlugin);

/*

	VerletStats: Simple, static wrapper for Mr Doob's Stats utility
*/


plugins.StatWrapper = (function(_super) {

  __extends(StatWrapper, _super);

  function StatWrapper() {
    this.update = __bind(this.update, this);
    return StatWrapper.__super__.constructor.apply(this, arguments);
  }

  StatWrapper.prototype.init = function(scene) {
    this.scene = scene;
    this.stats = new Stats();
    this.stats.domElement.setAttribute("style", "position:fixed; top: 0; left: 0;");
    return document.body.appendChild(this.stats.domElement);
  };

  StatWrapper.prototype.update = function() {
    this.stats.begin();
    return this.stats.end();
  };

  return StatWrapper;

})(plugins.BasePlugin);

/* 

	VerletWind: Applies a turbulance force using noise to points based on their position
*/


plugins.Wind = (function(_super) {

  __extends(Wind, _super);

  Wind.prototype.speed = 0.01;

  Wind.prototype.zoom = 0.002;

  Wind.prototype.strength = 0.1;

  Wind.prototype.windPoints = null;

  Wind.prototype.offsetX = 1.0;

  Wind.prototype.offsetY = 1.0;

  Wind.prototype.offsetZ = 1.0;

  Wind.prototype.skip = 0;

  function Wind(useSvgPoints) {
    this.useSvgPoints = useSvgPoints != null ? useSvgPoints : false;
    this.id = "instance" + Math.floor(Math.random() * 10000);
    this.strength = 0.1;
    this.zoom = 0.002;
    this.speed = 0.01;
    this.offsetZ = Math.random() * 100.0;
  }

  Wind.prototype.init = function(scene) {
    var p, _, _i, _len, _ref;
    this.scene = scene;
    _ = this;
    this.windPoints = [];
    if (this.useSvgPoints) {
      $(this.scene.dom).find('[id^="Wind"]').find("circle,ellipse").each(function() {
        var c, p, x, y;
        c = $(this);
        x = c.attr('cx');
        y = c.attr('cy');
        c.remove();
        p = _.scene.addPoint(x, y);
        return _.windPoints.push(p);
      });
    } else {
      _ref = this.scene.points;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        p = _ref[_i];
        if (!p.locked) {
          this.windPoints.push(p);
        }
      }
    }
  };

  Wind.prototype.update = function() {
    var currentStrength, maxNoise, p, ynoise, _i, _len, _ref;
    currentStrength = BaseScene.currentTimeStep * this.strength;
    _ref = this.windPoints;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      p = _ref[_i];
      ynoise = improvedNoise.noise(p.x * this.zoom + 1.0 + this.offsetX, p.y * this.zoom + this.offsetY, this.offsetZ) * currentStrength;
      if (ynoise > maxNoise) {
        maxNoise = ynoise;
      }
      p.force(improvedNoise.noise(p.x * this.zoom + this.offsetX, p.y * this.zoom + this.offsetY, this.offsetZ) * currentStrength, ynoise);
    }
    this.offsetZ += this.speed;
  };

  return Wind;

})(plugins.BasePlugin);

/*

	SvgPoint: Interface for updating SVG polylines with the point data from VerletPoint
*/


svg.Path = (function() {

  Path.prototype.svg = null;

  Path.prototype.ab = 0;

  Path.prototype.points = null;

  function Path(svg, points) {
    this.svg = svg;
    this.points = points;
  }

  Path.prototype.update = function() {
    var p, pAr, _i, _len, _ref;
    pAr = [];
    _ref = this.points;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      p = _ref[_i];
      pAr.push(p.x + "," + p.y + "");
    }
    return this.svg.setAttribute("d", "M" + pAr.join("l"));
  };

  return Path;

})();

/*

	SvgPoint: Interface for updating SVG elements with the point data from VerletPoint
*/


svg.Point = (function() {

  Point.prototype.svg = null;

  Point.prototype.ab = 0;

  Point.prototype.point = null;

  Point.prototype.lastValX = 0.0;

  Point.prototype.lastValY = 0.0;

  function Point(svg, ab, point) {
    this.svg = svg;
    this.ab = ab;
    this.point = point;
    if (this.ab === 1) {
      this.update = function() {
        this.svg.setAttribute('x1', this.point.x);
        this.svg.setAttribute('y1', this.point.y);
        this.lastValX = this.point.x;
        return this.lastValY = this.point.y;
      };
    } else {
      this.update = function() {
        this.svg.setAttribute('x2', this.point.x);
        this.svg.setAttribute('y2', this.point.y);
        this.lastValX = this.point.x;
        return this.lastValY = this.point.y;
      };
    }
  }

  return Point;

})();

/*

	SvgPoint: Interface for updating SVG polylines with the point data from VerletPoint
*/


svg.PolyLine = (function() {

  PolyLine.prototype.svg = null;

  PolyLine.prototype.ab = 0;

  PolyLine.prototype.points = null;

  function PolyLine(svg, points) {
    this.svg = svg;
    this.points = points;
  }

  PolyLine.prototype.update = function() {
    var p, pStr, _i, _len, _ref;
    pStr = "";
    _ref = this.points;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      p = _ref[_i];
      pStr += p.x + "," + p.y + " ";
    }
    return this.svg.setAttribute("points", pStr);
  };

  /*
  
  	VerletStickLink: Complex objects and groups can be attached to a single object in the Verlet scene.
  	Example: Hello scene (Twitter link attached to a single line)
  
  	- SVG line element must exist in "Links" group. This must be a line so that the rotation can be determined each frame.
  	- Corresponding linked element must exist in "Statics" Group. This can be any type of element-- path, group, polyline etc.
  
  	Links Group -> LinkFoo
  	Statics -> Foo
  
  	The static object will follow the movement and rotation of the Link object
  */


  return PolyLine;

})();

svg.StickLink = (function(_super) {

  __extends(StickLink, _super);

  function StickLink() {
    this.offsetPolygon = __bind(this.offsetPolygon, this);

    this.offsetChildren = __bind(this.offsetChildren, this);
    return StickLink.__super__.constructor.apply(this, arguments);
  }

  StickLink.prototype.rotation = 0;

  StickLink.prototype.link = null;

  StickLink.prototype.update = function() {
    var ax, ay, rot;
    rot = Math.atan2(this.pointb.y - this.pointa.y, this.pointb.x - this.pointa.x) * RAD_2_DEG;
    ax = Math.round(this.pointa.x * 10) / 10;
    ay = Math.round(this.pointa.y * 10) / 10;
    return this.link.setAttribute("transform", "translate(" + ax + "," + ay + ") rotate(" + rot + ")");
  };

  StickLink.prototype.setLink = function(l) {
    var _;
    this.link = l;
    _ = this;
    return this.offsetChildren(l);
  };

  StickLink.prototype.offsetChildren = function(target) {
    var _;
    _ = this;
    return $(target).children().each(function() {
      return this.setAttribute("transform", "translate(-" + _.pointa.x + ", -" + _.pointa.y + ")");
    });
  };

  StickLink.prototype.offsetPolygon = function(target) {
    var p, pointStr, scratchPoints, _i, _len, _ref;
    scratchPoints = "";
    _ref = target.getAttribute("points").split(" ");
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      pointStr = _ref[_i];
      p = pointStr.split(",");
      if (p.length > 1) {
        p[0] -= this.pointa.x;
        p[1] -= this.pointa.y;
        scratchPoints += p[0] + "," + p[1] + " ";
      }
    }
    return target.setAttribute("points", scratchPoints);
  };

  return StickLink;

})(verlet.Stick);

/*

	util.Color: Basic color class for converting HSV, RGB, and HEX etc
*/


util.Color = (function() {

  function Color() {}

  Color.hexToRgb = function(a) {
    if (typeof a === "string") {
      a = a.match(/\w\w/g);
    }
    return ["0x" + a[0] - 0, "0x" + a[1] - 0, "0x" + a[2] - 0];
  };

  Color.componentToHex = function(c) {
    var hex;
    hex = c.toString(16);
    if (hex.length === 1) {
      return "0" + hex;
    } else {
      return hex;
    }
  };

  Color.rgbToHex = function(r, g, b) {
    return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
  };

  Color.hsvToHex = function(h, s, v) {
    var b, f, g, i, p, q, r, t;
    r = void 0;
    g = void 0;
    b = void 0;
    i = void 0;
    f = void 0;
    p = void 0;
    q = void 0;
    t = void 0;
    if (h && s === undefined && v === undefined) {
      s = h.s;
      v = h.v;
      h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
      case 0:
        r = v;
        g = t;
        b = p;
        break;
      case 1:
        r = q;
        g = v;
        b = p;
        break;
      case 2:
        r = p;
        g = v;
        b = t;
        break;
      case 3:
        r = p;
        g = q;
        b = v;
        break;
      case 4:
        r = t;
        g = p;
        b = v;
        break;
      case 5:
        r = v;
        g = p;
        b = q;
    }
    return this.rgbToHex(Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255));
  };

  return Color;

})();

/*

	GeneralUtil: Misc helper functions
*/


util.General = (function() {

  function General() {}

  General.copyObject = function(from, to) {
    var k, v;
    for (k in from) {
      v = from[k];
      to[k] = v;
    }
  };

  General.propertyById = function(obj, id) {
    var i, k, v;
    i = 0;
    for (k in obj) {
      v = obj[k];
      if (i === id) {
        return obj[k];
      }
      i++;
    }
    return void 0;
  };

  General.randomSeed = 1;

  General.randomFromSeed = function() {
    var x;
    x = Math.sin(this.randomSeed++) * 10000;
    return x - Math.floor(x);
  };

  General.randomPropery = function(obj) {
    var count, p, result;
    count = 0;
    result = null;
    for (p in obj) {
      if (Math.random() < 1 / ++count) {
        result = p;
      }
    }
    return obj[result];
  };

  General.copyToNewObject = function(from) {
    var k, to, v;
    to = {};
    for (k in from) {
      v = from[k];
      to[k] = v;
    }
    return to;
  };

  General.objectPropertyLength = function(obj) {
    var i, k, v;
    i = 0;
    for (k in obj) {
      v = obj[k];
      i++;
    }
    return i;
  };

  General.randomFromArray = function(array) {
    return array[Math.floor(Math.random() * array.length)];
  };

  General.randomFromRange = function(start, end) {
    return start + (Math.random() * (end - start));
  };

  return General;

})();

RAD_2_DEG = 180 / Math.PI;

/*
	
	Quadtree: For quickly determining if points overlap. 
	Used to create the verlet stick connections
*/


util.QuadTree = (function() {

  function QuadTree(bounds, max_objects, max_levels, level) {
    this.max_objects = max_objects != null ? max_objects : 5;
    this.max_levels = max_levels != null ? max_levels : 4;
    this.level = level != null ? level : 0;
    this.retrieve = __bind(this.retrieve, this);

    this.find = __bind(this.find, this);

    this.insert = __bind(this.insert, this);

    this.getIndex = __bind(this.getIndex, this);

    this.split = __bind(this.split, this);

    this.bounds = bounds || {
      x: -20,
      y: -20,
      width: 2048,
      height: 2048
    };
    this.objects = [];
    this.nodes = [];
  }

  QuadTree.prototype.split = function() {
    var nextLevel, subHeight, subWidth, x, y;
    nextLevel = this.level + 1;
    subWidth = Math.round(this.bounds.width / 2);
    subHeight = Math.round(this.bounds.height / 2);
    x = Math.round(this.bounds.x);
    y = Math.round(this.bounds.y);
    this.nodes[0] = new QuadTree({
      x: x + subWidth,
      y: y,
      width: subWidth,
      height: subHeight
    }, this.max_objects, this.max_levels, nextLevel);
    this.nodes[1] = new QuadTree({
      x: x,
      y: y,
      width: subWidth,
      height: subHeight
    }, this.max_objects, this.max_levels, nextLevel);
    this.nodes[2] = new QuadTree({
      x: x,
      y: y + subHeight,
      width: subWidth,
      height: subHeight
    }, this.max_objects, this.max_levels, nextLevel);
    return this.nodes[3] = new QuadTree({
      x: x + subWidth,
      y: y + subHeight,
      width: subWidth,
      height: subHeight
    }, this.max_objects, this.max_levels, nextLevel);
  };

  QuadTree.prototype.getIndex = function(rect) {
    var bottomQuadrant, horizontalMidpoint, index, topQuadrant, verticalMidpoint;
    index = -1;
    verticalMidpoint = this.bounds.x + (this.bounds.width / 2);
    horizontalMidpoint = this.bounds.y + (this.bounds.height / 2);
    topQuadrant = rect.y < horizontalMidpoint && rect.y + rect.height < horizontalMidpoint;
    bottomQuadrant = rect.y > horizontalMidpoint;
    if (rect.x < verticalMidpoint && rect.x + rect.width < verticalMidpoint) {
      if (topQuadrant) {
        index = 1;
      } else {
        if (bottomQuadrant) {
          index = 2;
        }
      }
    } else if (rect.x > verticalMidpoint) {
      if (topQuadrant) {
        index = 0;
      } else {
        if (bottomQuadrant) {
          index = 3;
        }
      }
    }
    return index;
  };

  QuadTree.prototype.insert = function(rect) {
    var i, index, t, _results;
    t = this;
    i = 0;
    index = void 0;
    if (typeof this.nodes[0] !== "undefined") {
      index = this.getIndex(rect);
      if (index !== -1) {
        this.nodes[index].insert(rect);
        return;
      }
    }
    this.objects.push(rect);
    if (this.objects.length > this.max_objects && this.level < this.max_levels) {
      if (typeof this.nodes[0] === "undefined") {
        this.split();
      }
      _results = [];
      while (i < this.objects.length) {
        index = this.getIndex(this.objects[i]);
        if (index !== -1) {
          _results.push(this.nodes[index].insert(this.objects.splice(i, 1)[0]));
        } else {
          _results.push(i = i + 1);
        }
      }
      return _results;
    }
  };

  QuadTree.prototype.find = function(rect) {
    var ar, n, _i, _len, _ref;
    ar = [];
    _ref = this.retrieve(rect);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      n = _ref[_i];
      if (n.x >= rect.x && n.y >= rect.y && n.x < (rect.width + rect.x) && n.y < (rect.height + rect.y)) {
        ar.push(n);
      }
    }
    return ar;
  };

  QuadTree.prototype.retrieve = function(rect) {
    var i, index, objs;
    index = this.getIndex(rect);
    objs = this.objects;
    if (typeof this.nodes[0] !== "undefined") {
      if (index !== -1) {
        objs = objs.concat(this.nodes[index].retrieve(rect));
      } else {
        i = 0;
        while (i < this.nodes.length) {
          objs = objs.concat(this.nodes[i].retrieve(rect));
          i = i + 1;
        }
      }
    }
    return objs;
  };

  QuadTree.prototype.clear = function() {
    var i, _results;
    this.objects = [];
    i = 0;
    _results = [];
    while (i < this.nodes.length) {
      if (typeof this.nodes[i] !== "undefined") {
        this.nodes[i].clear();
        delete this.nodes[i];
      }
      _results.push(i = i + 1);
    }
    return _results;
  };

  return QuadTree;

})();

/*
	
	VerletPoint: Tracks the location and force of a point.

	VerletStick updates the force each frame
*/


verlet.Point = (function() {

  Point.prototype.down = false;

  Point.prototype.oldX = null;

  Point.prototype.oldY = null;

  Point.prototype.originalX = 0;

  Point.prototype.originalY = 0;

  Point.prototype.x = 0;

  Point.prototype.y = 0;

  Point.prototype.forceX = 0;

  Point.prototype.forceY = 0;

  Point.scene = null;

  function Point(x, y, locked) {
    this.x = x;
    this.y = y;
    this.locked = locked != null ? locked : false;
    this.originalX = this.oldX = this.x;
    this.originalY = this.oldY = this.y;
  }

  Point.prototype.setPos = function(x, y) {
    this.x = this.oldX = x;
    return this.y = this.oldY = y;
  };

  Point.prototype.force = function(x, y) {
    this.forceX += x;
    return this.forceY += y;
  };

  Point.prototype.update = function() {
    var tempX, tempY;
    if (this.dead || this.down || this.locked) {
      return null;
    }
    tempX = this.x;
    tempY = this.y;
    this.x += this.x - this.oldX + this.forceX;
    this.y += this.y - this.oldY + this.forceY;
    this.oldX = tempX;
    this.oldY = tempY;
    this.forceX = 0;
    this.forceY = 0;
    return null;
  };

  return Point;

})();

/*
	
	RubberPoint: Adds a force to the original position

	VerletStick updates the force each frame
*/


verlet.RubberPoint = (function(_super) {

  __extends(RubberPoint, _super);

  RubberPoint.prototype.rubberAmplitude = 0.1;

  RubberPoint.prototype.rubberDamping = 0.1;

  RubberPoint.prototype.rubberForceX = 0;

  RubberPoint.prototype.rubberForceY = 0;

  RubberPoint.maxAmp = 0.02;

  RubberPoint.minAmp = 0.005;

  function RubberPoint(x, y, locked) {
    this.x = x;
    this.y = y;
    this.locked = locked != null ? locked : false;
    RubberPoint.__super__.constructor.call(this, this.x, this.y, this.locked);
    this.rubberAmplitude = util.General.randomFromRange(verlet.RubberPoint.minAmp, verlet.RubberPoint.maxAmp);
  }

  RubberPoint.prototype.update = function() {
    if (this.dead || this.down || this.locked) {
      return null;
    }
    this.rubberForceX = (this.originalX - this.x) * this.rubberAmplitude * BaseScene.currentTimeStep;
    this.rubberForceY = (this.originalY - this.y) * this.rubberAmplitude * BaseScene.currentTimeStep;
    this.x += this.rubberForceX;
    this.y += this.rubberForceY;
    return RubberPoint.__super__.update.call(this);
  };

  RubberPoint.resetDefaults = function() {
    verlet.RubberPoint.minAmp = 0.02;
    return verlet.RubberPoint.maxAmp = 0.005;
  };

  return RubberPoint;

})(verlet.Point);
