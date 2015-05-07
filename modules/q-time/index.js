var q = require('q');

module.exports.after = function after(ms) {
  var deferred = q.defer();
  setTimeout(function() {
    deferred.resolve(null);
  }, ms);

  return deferred.promise;
};

