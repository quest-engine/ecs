
var Observer = {
  on: function (event, callback) {
    if (!this.__callbacks[event]) {
      this.__callbacks[event] = [];
    }

    var callbacks = this.__callbacks[event];

    callbacks.push(callback);
  },
  emit: function (event) {
    var args = Array.prototype.slice.call(arguments);

    args.splice(0, 1);

    var callbacks = this.__callbacks[event];

    if (!callbacks) {
      return;
    }

    for (var i = 0; i < callbacks.length; i += 1) {
      callbacks[i].apply(null, args);
    }
  }
};

var Observable = {
  make: function (obj) {
    for (var e in Observer) {
      obj[e] = Observer[e];
    }

    obj.__callbacks = [];
  }
};
