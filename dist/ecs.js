/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

  // The base Class implementation (does nothing)
  this.Class = function(){};

  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;

    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;

    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
          typeof _super[name] == "function" && fnTest.test(prop[name]) ?
          (function(name, fn){
            return function() {
              var tmp = this._super;

              // Add a new ._super() method that is the same method
              // but on the super-class
              this._super = _super[name];

              // The method only need to be bound temporarily, so we
              // remove it when we're done executing
              var ret = fn.apply(this, arguments);
              this._super = tmp;

              return ret;
            };
          })(name, prop[name]) :
          prop[name];
    }

    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }

    // Populate our constructed prototype object
    Class.prototype = prototype;

    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;

    return Class;
  };
}.bind(window))();

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

/*global Component, Entity, System */

var ECS = {
  Entity: Entity,
  entities: [],
  Component: Component,
  System: System,
  systems: [],
  tick: tick
};

function tick() {
  "use strict";

  var i, e, sys, ent;

  for (e = 0; e < ECS.entities.length; e += 1) {
    ent = ECS.entities[e];

    for (i = 0; i < ECS.systems.length; i += 1) {
      sys = ECS.systems[i];

      if (sys.shouldProcess(ent)) {
        sys.tick(ent);
      }
    }
  }
}