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

  var stopped = true;
  var moves = [];
  var movesQueue = [];

  my.sphero.on("collision", collision);

  init().then(main);

  // ----------------------------------------

  function flashRed() {
    my.sphero.setRGB(0xFF0000);
    qt.after(400)
      .then(my.sphero.setRGB(0xBB0000))
      .then(qt.after(400))
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
    var impact = convertCollisionData(data.DATA);
    var impactStrength = Math.sqrt(impact.xImpact * impact.xImpact + impact.yImpact * impact.yImpact).toFixed(1);
    console.info("Impact force: " + impactStrength + " -> " + JSON.stringify(impact));
    flashRed(1);
    if (impactStrength > 40) {
      console.info("Reacting to impact\n\n");
      my.sphero.stop();
      stopped = true;
      collisionCount.total++;
      collisionCount.recent++;
      if (collisionCount.recent > 2) {
        console.info('Shutting down...');
        process.exit(1);
      } else {
        if (moves.length != 0) {
          var lastMove = moves.slice(-1)[0];
          var direction = lastMove.direction + 180;
          if (direction > 360) {
            direction -= 360;
          }
          movesQueue.push({
            direction: direction,
            speed: lastMove.speed
          });
        }
        //console.info("Preparing to alter course to " + direction + " degrees at speed of " + lastMove.speed);
        qt.after((2).seconds()).then(function() {stopped = false;});
      }
    }
  }

  function convertToSignedInt(msb, lsb) {
    var negative = msb > 128;
    if (negative) {
      msb -= 128;
    }
    var value = msb*256 + lsb;
    if (negative) {
      value = 0 - value;
    }
    return value;
  }

  function convertCollisionData(data) {
    var obj = {};
/*
    obj.xPower = convertToSignedInt(data[0], data[1]);
    obj.yPower = convertToSignedInt(data[2], data[3]);
    obj.zPower = convertToSignedInt(data[4], data[5]);
    obj.impactAxis = data[6];
*/
    obj.xImpact = convertToSignedInt(data[7], data[8]);
    obj.yImpact = convertToSignedInt(data[9], data[10]);
    obj.speed = data[11];

    return obj;
  }

  function init() {
    console.info("Initializing application");
    my.sphero.configureCollisionDetection(0x01, 0x40, 0x40, 0x40, 0x40, 0x50); // defaults: 0x01, 0x40, 0x40, 0x50, 0x50, 0x50

    //my.sphero.detectLocator();
    resetColor();
    my.sphero.startCalibration();
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

    every((1).seconds(), function () {
      if (collisionCount.recent > 0) {
        collisionCount.recent--;
        //console.info('Decreasing collision count by one');
      }
      if (stopped) {
        collisionCount.recent = 0;
      }
    });

    every((1).second(), function () {
      var speed, direction;
      if (!stopped) {
        my.sphero.finishCalibration();
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
        console.info(direction + " degrees at speed of " + speed);
        moves.push({ // maintain log of previous moves for some future use
          direction: direction,
          speed: speed
        });
      }
    });

    return;
  }
};

