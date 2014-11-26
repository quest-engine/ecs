
/*global Observer, ECS */

var Entity = Observer.extend({
  init: function (data) {
    "use strict";

    this._super();

    /*jshint bitwise:false*/
    this.id = (+new Date()).toString(16) + (Math.random() * 100000000 | 0).toString(16) +
        Entity.prototype._count;
    /*jshint bitwise:false*/

    this.cmp = {};

    if (data) {
      this.update(data);
    }
  },
  /**
   * getter/setter method for entity components
   * please note that this method is about 80% than accessing properties directly with
   * the "cmp" attribute
   * @see http://jsperf.com/array-brackets-notation-vs-point-notation
   * @param arg0 the name of the component or a components tree (for bulk update)
   * @param arg1 the component data when updating and using arg0 as name
   * @returns data of the components, null if components does not exists
   */
  component: function (arg0, arg1) {
    "use strict";

    if (arg1) {
      this.updateComponent(arg0, arg1);
    } else {
      return this.cmp[arg0];
    }

    return null;
  },
  update: function (data) {
    "use strict";

    for (var e in data) {
      if (data.hasOwnProperty(e)) {
        this.updateComponent(e, data[e]);
      }
    }
  },
  updateComponent: function (name, data) {
    "use strict";

    // allow a string or component function to be passed in
    if(typeof name === 'function'){
      name = name.prototype.name;
    }

    if (!this.cmp[name]) {
      this.cmp[name] = {};
    }

    var cmp = this.cmp[name];

    if (cmp && cmp.update) {
      cmp.update(data);
    } else if (cmp) {
      for (var e in data) {
        if (data.hasOwnProperty(e)) {
          cmp[e] = data[e];
        }
      }
    }
  },
  addComponent: function (component) {
    "use strict";

    this.cmp[component.name] = component;
  },
  removeComponent: function (component) {
    "use strict";

    var name = component;

    // allow a string or component function to be passed in
    if(typeof component === 'function'){
      name = component.prototype.name;
    }

    delete this.cmp[name];
  }
});

Entity.prototype._count = 0;