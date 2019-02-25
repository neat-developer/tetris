"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// Lets develop some js code
var PIXELS_TILE = 'pixels';

var Tetris =
/*#__PURE__*/
function () {
  function Tetris(options) {
    _classCallCheck(this, Tetris);

    this.options = options;
    this.latestTimeStamp = null;
    this.images = [];
    this.canvas = document.getElementById(this.options.id);
    this.ctx = this.canvas && this.canvas.getContext('2d');
    this.store = {}; // our figure store

    this.boxSize = 39;
    this.boxCountWidth = 10;
    this.boxCountHeight = 15;
    this.activeElement = null;
    this.nextElement = null;
    this.score = 0;
    this.elements = options.elements;
    this.colors = {
      table: "#221f28",
      grid: "#656369"
    };
    this.positions = {
      "aria": {
        "x": 20,
        y: 100
      }
    };
    this.init();
  } // Interfaces Methods


  _createClass(Tetris, [{
    key: "clearCanvas",
    value: function clearCanvas() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }, {
    key: "drawGrid",
    value: function drawGrid() {
      for (var i = 0; i < this.boxCountWidth; i++) {
        for (var j = 0; j < this.boxCountHeight; j++) {
          var storeKey = this.getBoxKey(i, j);
          var x = this.positions.aria.x + i * this.boxSize;
          var y = this.positions.aria.y + j * this.boxSize;
          this.ctx.strokeStyle = this.colors.grid;
          this.ctx.strokeRect(x, y, this.boxSize, this.boxSize);
          this.store[storeKey] !== undefined && this.drawBox(x, y, this.store[storeKey]);
        }
      }
    }
    /**
     * Draw cube in Aria by x, y, color
     */

  }, {
    key: "drawBox",
    value: function drawBox(x, y, color) {
      var _this = this;

      var positionByColor = [0, 1, 2, 3, 4, 5].reduce(function (prev, cur, idx) {
        prev[idx] = cur * _this.boxSize;
        return prev;
      }, {});
      this.ctx.drawImage(this.images[PIXELS_TILE], positionByColor[color], 0, this.boxSize, this.boxSize, x, y, this.boxSize, this.boxSize);
    }
  }, {
    key: "drawScore",
    value: function drawScore() {
      this.ctx.font = "30px Comic Sans MS";
      this.ctx.fillStyle = "white";
      this.ctx.fillText("Score: " + this.score, this.positions.aria.x, this.positions.aria.y + this.boxCountHeight * this.boxSize + 40);
    }
  }, {
    key: "drawNextElement",
    value: function drawNextElement() {
      var _this2 = this;

      this.ctx.font = "30px Comic Sans MS";
      this.ctx.fillStyle = "white";
      var positions = {
        x: this.positions.aria.x + this.boxCountWidth * this.boxSize + 70,
        y: this.positions.aria.y,
        // Added next elements position
        "0": {
          x: 20,
          y: 25
        },
        "1": {
          x: 0,
          y: 25
        },
        "2": {
          x: -25,
          y: 25
        },
        "3": {
          x: -50,
          y: 25
        },
        "4": {
          x: -50,
          y: 25
        }
      };
      var filteredByXElement = this.nextElement.elements.map(function (el) {
        return el.x;
      });
      filteredByXElement = Math.max.apply(Math, filteredByXElement);
      this.ctx.fillText("Next", positions.x, positions.y); // next elements

      this.nextElement.elements.forEach(function (element) {
        _this2.drawBox(element.x * _this2.boxSize + positions.x + positions[filteredByXElement].x, element.y * _this2.boxSize + positions.y + positions[filteredByXElement].y, _this2.nextElement.color);
      });
    }
  }, {
    key: "drawTableGame",
    value: function drawTableGame() {
      var w = this.boxSize * this.boxCountWidth;
      var h = this.boxSize * this.boxCountHeight;
      this.ctx.fillStyle = this.colors.table;
      this.ctx.fillRect(this.positions.aria.x, this.positions.aria.y, w, h);
    }
  }, {
    key: "drawActiveElement",
    value: function drawActiveElement() {
      var _this3 = this;

      this.activeElement.elements.forEach(function (element) {
        var x = _this3.boxSize * (_this3.activeElement.x + element.x) + _this3.positions.aria.x;
        var y = _this3.boxSize * (_this3.activeElement.y + element.y) + _this3.positions.aria.y;

        _this3.drawBox(x, y, _this3.activeElement.color);
      });
    } // Services Methods

  }, {
    key: "init",
    value: function init() {
      var _this4 = this;

      this.loadImages(this.options.images, function () {
        _this4.setActiveElement();

        _this4.initEvents();

        window.requestAnimationFrame(function () {
          _this4.updateLoopFrame();

          _this4.updateTimeStamp();
        });
      });
    }
    /**
     * Game loop it's brain of the game
     */

  }, {
    key: "loop",
    value: function loop() {
      if (new Date().getTime() - this.latestTimeStamp > this.options.speed) {
        this.updatePosition();
        this.clearCanvas();
        this.drawTableGame();
        this.drawGrid();
        this.drawActiveElement();
        this.drawScore();
        this.drawNextElement();
        this.updateTimeStamp();
      }

      this.updateLoopFrame();
    }
  }, {
    key: "updateLoopFrame",
    value: function updateLoopFrame() {
      var _this5 = this;

      window.requestAnimationFrame(function () {
        _this5.loop();
      });
    }
  }, {
    key: "updateTimeStamp",
    value: function updateTimeStamp() {
      this.latestTimeStamp = +new Date();
    }
  }, {
    key: "updatePosition",
    value: function updatePosition() {
      if (!this.thereIsCollision({
        type: 'update'
      })) this.activeElement.y++;
    }
  }, {
    key: "thereIsCollision",
    value: function thereIsCollision(options) {
      var _this6 = this;

      var thereIsCollision = false;

      switch (options.type) {
        case 'border':
          {
            var _loop = function _loop(key) {
              _this6.activeElement.elements.forEach(function (element) {
                var nextXPos = options.right ? element.x + 1 : element.x - 1;
                if (key === _this6.getBoxKey(nextXPos + _this6.activeElement.x, _this6.activeElement.y + element.y)) thereIsCollision = true;
              });
            };

            for (var key in this.store) {
              _loop(key);
            }

            this.activeElement.elements.forEach(function (element) {
              var nextXPos = options.right ? element.x + 1 : element.x - 1;
              if (_this6.activeElement.x + nextXPos < 0 || _this6.activeElement.x + nextXPos === _this6.boxCountWidth) thereIsCollision = true;
            });
          }
          break;

        case 'update':
          {
            (function () {
              var nextYPos = _this6.activeElement.y + 1;
              var gameOver = false;

              var _loop2 = function _loop2(key) {
                _this6.activeElement.elements.forEach(function (element) {
                  if (key === _this6.getBoxKey(element.x + _this6.activeElement.x, nextYPos + element.y)) thereIsCollision = true;
                });
              };

              for (var key in _this6.store) {
                _loop2(key);
              }

              !thereIsCollision && _this6.activeElement.elements.forEach(function (element) {
                if (nextYPos + element.y === _this6.boxCountHeight) thereIsCollision = true;
              }); // Game over Test

              thereIsCollision && _this6.activeElement.elements.forEach(function (element) {
                if (element.y + _this6.activeElement.y === 0) {
                  gameOver = true;
                  _this6.score = 0;
                  _this6.store = {};
                  _this6.activeElement = null;
                  _this6.nextElement = null;

                  _this6.clearCanvas();

                  _this6.setActiveElement();
                }
              });

              if (thereIsCollision && !gameOver) {
                _this6.activeElement.elements.forEach(function (element) {
                  _this6.addElementToStore(_this6.activeElement.x + element.x, _this6.activeElement.y + element.y, _this6.activeElement.color);
                });

                _this6.activeElement = null;

                _this6.setActiveElement();
              } //     Level complete


              _this6.levelComplete();
            })();
          }
          break;

        case 'rotate':
          {
            var _loop3 = function _loop3(key) {
              options.elements.forEach(function (element) {
                if (key === _this6.getBoxKey(element.x + _this6.activeElement.x, _this6.activeElement.y + element.y)) thereIsCollision = true;
              });
            };

            for (var key in this.store) {
              _loop3(key);
            }

            !thereIsCollision && options.elements.forEach(function (element) {
              // test bottom collision
              // write here because this.store can be empty!
              if (element.y + _this6.activeElement.y >= _this6.boxCountHeight) thereIsCollision = true;
              if (element.x + _this6.activeElement.x >= _this6.boxCountWidth || element.x + _this6.activeElement.x < 0) thereIsCollision = true;
            });
          }
      }

      return thereIsCollision;
    }
  }, {
    key: "levelComplete",
    value: function levelComplete() {
      var removedLevel = null;

      for (var keyStore in this.store) {
        var keyStorePosition = this.getPositionByKey(keyStore);
        var currentCompleteLevel = 1;

        for (var key in this.store) {
          var keyPosition = this.getPositionByKey(key);
          if (key !== keyStore && keyStorePosition.y === keyPosition.y) currentCompleteLevel++;
        }

        if (currentCompleteLevel === this.boxCountWidth && !removedLevel) removedLevel = keyStorePosition.y;
      }

      if (removedLevel) {
        this.removeLevel(removedLevel);
        this.shiftLevel(removedLevel);
        this.levelComplete();
      }
    }
  }, {
    key: "shiftLevel",
    value: function shiftLevel(level) {
      if (level === 0) return false;
      level -= 1;

      for (var keyStore in this.store) {
        var keyStorePosition = this.getPositionByKey(keyStore);

        if (keyStorePosition.y === level) {
          this.addElementToStore(keyStorePosition.x, keyStorePosition.y + 1, this.store[keyStore]);
          delete this.store[keyStore];
        }
      }

      this.shiftLevel(level);
    }
  }, {
    key: "removeLevel",
    value: function removeLevel(y) {
      for (var keyStore in this.store) {
        var keyStorePosition = this.getPositionByKey(keyStore);

        if (keyStorePosition.y === y) {
          this.score++;
          delete this.store[keyStore];
        }
      }
    }
    /**
     *
     * @param keys
     * @returns {{x: *, y: *}}
     */

  }, {
    key: "getPositionByKey",
    value: function getPositionByKey(keys) {
      var key = keys.split("|").map(Number);
      return {
        x: key[0],
        y: key[1]
      };
    }
    /**
     * save elements to store by x,y,color
     */

  }, {
    key: "addElementToStore",
    value: function addElementToStore(x, y, color) {
      this.store[this.getBoxKey(x, y)] = color;
    }
    /**
     * Set active and next elements to aria
     * @returns {boolean}
     */

  }, {
    key: "setActiveElement",
    value: function setActiveElement() {
      if (this.activeElement) return false;
      var randomElement = getRandomElement.bind(this);

      if (!this.activeElement && !this.nextElement) {
        this.activeElement = randomElement();
        this.nextElement = randomElement();
        return false;
      }

      if (!this.activeElement && this.nextElement) {
        this.activeElement = this.nextElement;
        this.nextElement = randomElement();
        return false;
      }

      function getRandomElement() {
        var elementIdx = random(0, this.elements.length - 1);
        var element = this.elements[elementIdx];
        var rotateIdx = random(0, element.length - 1);
        var elements = this.elements[elementIdx][rotateIdx];
        var color = random(0, 5);
        var x = 5;
        var y = 0;
        return {
          x: x,
          y: y,
          elements: elements,
          color: color,
          rotateIdx: rotateIdx,
          elementIdx: elementIdx
        };
      }
    }
  }, {
    key: "getBoxKey",
    value: function getBoxKey(x, y) {
      return "".concat(x, "|").concat(y);
    }
    /**
     * Init  game events
     */

  }, {
    key: "initEvents",
    value: function initEvents() {
      var _this7 = this;

      document.addEventListener('keydown', function (e) {
        var keyCode = e.keyCode;
        if (keyCode === 37 && !_this7.thereIsCollision({
          type: 'border'
        })) _this7.activeElement.x--; // to left

        if (keyCode === 39 && !_this7.thereIsCollision({
          type: 'border',
          right: true
        })) _this7.activeElement.x++; // to right

        if (keyCode === 32) {
          // space
          var currentRotate = _this7.activeElement.rotateIdx;
          var maxRotate = _this7.elements[_this7.activeElement.elementIdx].length - 1;
          var nextRotate = currentRotate === maxRotate ? 0 : currentRotate + 1;
          var nextElements = _this7.elements[_this7.activeElement.elementIdx][nextRotate];

          if (!_this7.thereIsCollision({
            type: 'rotate',
            elements: nextElements
          })) {
            _this7.activeElement.elements = nextElements;
            _this7.activeElement.rotateIdx = nextRotate;
          }
        }

        _this7.clearCanvas();

        _this7.drawTableGame();

        _this7.drawGrid();

        _this7.drawActiveElement();

        _this7.drawScore();

        _this7.drawNextElement();
      });
    }
  }, {
    key: "loadImages",
    value: function loadImages(images, callback) {
      var _this8 = this;

      var promises = [];
      Array.isArray(images) && images.forEach(function (image) {
        promises.push(new Promise(function (resolve) {
          var img = new Image();
          img.src = image.path;

          img.onload = function () {
            _this8.images[image.name] = img;
            resolve();
          };
        }));
      });
      Promise.all(promises).then(function () {
        callback();
      });
    }
  }]);

  return Tetris;
}();

(function () {
  fetch('assets/elements.json').then(function (res) {
    return res.json();
  }).then(function (elements) {
    // Dont worry elements it's our tetris figures 
    new Tetris({
      id: "game",
      elements: elements,
      speed: 200,
      images: [{
        name: PIXELS_TILE,
        path: "image/elements.png"
      }]
    });
  });
})();

function random(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}