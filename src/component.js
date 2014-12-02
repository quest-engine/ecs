
function _Component() {}

_Component.prototype.update = function (data) {
  var e;

  for (e in data) {
    if (data.hasOwnProperty(e)) {
      this[e] = data[e];
    }
  }
};

var Component = {
  make: function (obj) {

  }
};