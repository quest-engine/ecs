
/*global Class, getClass */

var Observer = Class.extend({
  init: function () {
    "use strict";

    this._callbacks = {};
  },
  on: function (event, callback) {
    "use strict";

    var i = 0, callbacks;

    if (!callback && getClass.call(callback) === '[object Function]') {
      return null;
    }

    if (!this._callbacks[event]) {
      this._callbacks[event] = [];
    }

    callbacks = this._callbacks[event];

    for (i = 0; i < callbacks.length; i += 1) {
      if (!callbacks[i]) {
        callbacks[i] = callback;
        break;
      }
    }

    if (i === callbacks.length) {
      callbacks.push(callback);
    }

    return {
      event: event,
      index: i
    };
  },
  trigger: function (event) {
    "use strict";

    if (!this._callbacks[event]) {
      return null;
    }

    var callbacks = this._callbacks[event];
    var args = Array.prototype.slice.call(arguments);

    // remove the first argument which is this
    args.splice(0, 1);

    for (var i = 0; i < callbacks.length; i += 1) {
      var cb = callbacks[i];

      if (cb) {
        cb.apply(null, args);
      }
    }

    return null;
  },
  clear: function (ptr) {
    "use strict";

    if(this._callbacks[ptr.event]) {
      this._callbacks[ptr.event][ptr.index] = null;
    }
  }
});
