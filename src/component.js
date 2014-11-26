
/*global Class */

var Component = Class.extend({
  init: function (data) {
    "use strict";

    if (data) {
      this.update(data);
    }
  },
  update: function (data) {
    "use strict";

    for (var e in data) {
      if (data.hasOwnProperty(e)) {
        this[e] = data[e];
      }
    }
  }
});
