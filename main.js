/**
 * Created with IntelliJ IDEA.
 * User: mfo
 * Date: 5/7/15
 * Time: 7:48 PM
 */
module.exports = function (my) {
  var collisionCount = {
    total: 0,
    recent: 0
  };

  my.sphero.detectCollisions();
  //my.sphero.detectLocator();
  my.sphero.setRGB(0x00FF00);

  my.sphero.on("collision", function () {
    console.log("Captain, we've been hit!");
    flashRed(1);
    my.sphero.stop();
  });

  qt.after(1000)
    .then(my.sphero.startCalibration())
    .then(qt.after(5000))
    .then(my.sphero.finishCalibration())
    .then(qt.after(100))
    .then();

  function main() {
    var deferred = Q.defer();

    console.info("Starting main routine. \n\n");
    every((1).second(), function () {
      var direction = Math.floor(Math.random() * 360);
      //my.sphero.roll(80, direction);
      flashRed();
    });

    return
  }

  function flashRed() {
    my.sphero.setRGB(0xFF0000);
    qt.after(100)
      .then(my.sphero.setRGB(0xBB0000))
      .then(qt.after(100))
      .then(my.sphero.setRGB(0x770000))
      .then(qt.after(100))
      .then(my.sphero.setRGB(0x330000))
      .then(qt.after(100))
      .then(resetColor());
  }

  function calibrate(seconds) {
    my.sphero.startCalibration();
    after((seconds).seconds(), function () {
      my.sphero.finishCalibration();
    });
  }

  function resetColor() {
    my.sphero.setRGB(0x000000);
  }
}
