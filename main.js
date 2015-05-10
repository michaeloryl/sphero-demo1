/**
 * Created with IntelliJ IDEA.
 * User: mfo
 * Date: 5/7/15
 * Time: 7:48 PM
 */
var qt = require('./modules/q-time');
var Q = require('q');

module.exports = function (my) {
  var collisionCount = {
    total: 0,
    recent: 0
  };

  var stopped = false;
  var moves = [];
  var movesQueue = [];

  my.sphero.on("collision", collision);

  init().then(main);

  // ----------------------------------------

  function flashRed() {
    my.sphero.setRGB(0xFF0000);
    qt.after(200)
      .then(my.sphero.setRGB(0xBB0000))
      .then(qt.after(200))
      .then(my.sphero.setRGB(0x770000))
      .then(qt.after(200))
      .then(my.sphero.setRGB(0x330000))
      .then(qt.after(200))
      .then(resetColor());
  }

  function flashBlue() {
    my.sphero.setRGB(0x0000FF);
    qt.after(500)
      .then(resetColor());
  }

  function calibrate(seconds) {
    my.sphero.startCalibration();
    after((seconds).seconds(), function () {
      my.sphero.finishCalibration();
    });
  }

  function resetColor() {
    my.sphero.setRGB(0x402000);
  }

  function collision(data) {
    console.info("Captain, we've been hit!");
    flashRed(1);
    my.sphero.stop();
    stopped = true;
    console.info(JSON.stringify(data));
    var impact = convertCollisionData(data.DATA);
    console.info(JSON.stringify(impact));
    collisionCount.total++;
    collisionCount.recent++;
    if (collisionCount.recent > 2) {
      console.info('Shutting down...');
      process.exit(1);
    } else {
      var lastMove = moves.slice(-1)[0];
      var direction = lastMove.direction + 180;
      if (direction > 360) {
        direction -= 360;
      }
      movesQueue.push({
        direction: direction,
        speed: lastMove.speed
      });
      //console.info("Preparing to alter course to " + direction + " degrees at speed of " + lastMove.speed);
      qt.after((2).seconds()).then(function() {stopped = false;});
    }
  }

  function convertCollisionData(data) {
    var obj = {};
    obj.xPower = data[0] + data[1]*256;
    obj.yPower = data[2] + data[3]*256;
    obj.zPower = data[4] + data[5]*256;
    obj.impactAxis = data[6];
    obj.xImpact = data[7];
    obj.yImpact = data[8];
    obj.speed = data[9];

    return obj;
  }

  function init() {
    console.info("Initializing application");
    my.sphero.configureCollisionDetection(0x01, 0x40, 0x40, 0x40, 0x40, 0x50); // defaults: 0x01, 0x40, 0x40, 0x50, 0x50, 0x50

    //my.sphero.detectLocator();
    resetColor();
    /*
     return qt.after(1000)
     .then(my.sphero.startCalibration())
     .then(my.sphero.setRGB(0xFFFF00))
     .then(qt.after(5000))
     .then(my.sphero.finishCalibration())
     .then(qt.after(100))
     .then(my.sphero.setRGB(0x000000))
     .then();
     */
    return qt.after(1);
  }

  function main() {
    console.info("Starting main process \n\n");

    every((4).seconds(), function () {
      if (collisionCount.recent > 0) {
        collisionCount.recent--;
        //console.info('Decreasing collision count by one');
      }
    });

    every((2).second(), function () {
      var speed, direction;
      if (movesQueue.length == 0) { // if no moves have been queued up, pick a random course
        direction = Math.floor(Math.random() * 360);
        speed = 70 + Math.floor(Math.random() * 75);
      } else { // otherwise take the last course in the queue
        var nextMove = movesQueue.pop();
        direction = nextMove.direction;
        speed = nextMove.speed;
      }
      my.sphero.roll(speed, direction);
      flashBlue();
      //console.info("Setting new course to " + direction + " degrees at speed of " + speed);
      moves.push({ // maintain log of previous moves for some future use
        direction: direction,
        speed: speed
      });
    });

    return;
  }
};

