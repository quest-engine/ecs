
/*global Class*/

var System = Class.extend({
  init: function () {},
  shouldProcess: function (entity) {
    "use strict";

    var i, c;

    for (i = 0; i < this.components.length; i += 1) {
      c = this.components[i];

      if (!entity.cmp[c]) {
        return false;
      }
    }

    return true;
  },
  tick: function (entities) {}
});

System.prototype.components = [];