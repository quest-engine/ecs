// observer.js, a simple simple to make your object evented
(function (global) {
  "use strict";

  // `window` in the browser or `global` on node
  var root = typeof window !== 'undefined' ? window : global;

  /**
 * return the index of an object in an array depending on the value of a
 * property
 * @param {array} array - the array
 * @param {string} pname - name of the property
 * @param {*} pvalue - expected value of the property
 * @returns {number} - the index if a hash was found, -1 otherwise
 * @private
 */
function _getIndexByProperty(array, pname, pvalue) {
  var i = 0;

  for (; i < array.length; i += 1) {
    if (array[i][pname] === pvalue) {
      return i;
    }
  }

  return -1;
}

/**
 * return an object in an array depending on the value of a property
 * @param {array} array - the array
 * @param {string} pname - name of the property
 * @param {*} pvalue - expected value of the property
 * @returns {*|null} - the hash if a hash was found, null otherwise
 * @private
 */
function _getValueByProperty(array, pname, pvalue) {
  var i = _getIndexByProperty(array, pname, pvalue);

  return array[i] || null;
}

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

/**
 * an entity objects which has an unique id and a collection of components
 * @constructor
 * @fires Entity#add
 * @fires Entity#update
 * @fires Entity#remove
 */
var Entity = function () {
  /**
   * unique id of the entity
   * @member {string}
   * */
  this.id = (+new Date()).toString(16) + (Math.random() * 100000000 | 0)
      .toString(16) + Entity.prototype._count;

  /**
   * collection of components
   * @member {object}
   */
  this.components = {};

  /**
   * internal table to store if each system should apply
   * @member {object}
   * @private
   */
  this._systems = {};

  // make every entity observable to emit and receive events
  Observable.make(this);

  Entity.prototype._count += 1;
};

/**
 * update one or multiple components
 * @param {string|function|object} arg0 - name of the component, arg1 is mandatory<br/>
 *   class of the component, arg1 is mandatory<br/>
 *   hash of components to apply to the entity which takes the form of:
 *   <pre>
 *     component1: {hello: "world"},
 *     component2: {foo: "bar"}
 *   </pre>
 * @param {object} [arg1] - data to apply to the component
 */
Entity.prototype.update = function (arg0, arg1) {
  if (arg1) {
    // if arg1 is defined then arg0 is either the name or the class of the
    // component
    var name = typeof arg0 === 'function' ? arg0.name : arg0;

    this._update(name, arg1);
  } else {
    // if arg1 is not defined then a hash of components to update was supplied
    var c;

    // for each component apply new values
    for (c in arg0) {
      if (arg0.hasOwnProperty(c)) {
        this._update(c, arg0[c]);
      }
    }
  }
};

/**
 * update one component, contrary to `update()` parameters are explicit
 * @param name {string} - name of the component
 * @param data {object} - data to apply to the component
 * @private
 */
Entity.prototype._update = function (name, data) {
  var component = this.components[name];

  if (component) {
    // if the component has an `update()` method, use it
    if (component.update && typeof component.update === 'function') {
      component.update(data);
    } else {
      var e;

      // apply new properties
      for (e in data) {
        if (data.hasOwnProperty(e)) {
          component[e] = data[e];
        }
      }
    }

    /**
     * report updates on components
     * @event Entity#update
     * @param {string} name - name of the updated component
     * @param {object} data - values of the component
     * @param {object} updated - data applied to the component
     */
    this.emit('update', name, component, data);
  } else {
    // if the component does not exists, add it silently
    this.components[name] = data;

    /**
     * report components added
     * @event Entity#add
     * @param {string} name - name of the added component
     * @param {object} data - data of the added component
     */
    this.emit('add', name, data);
  }
};

/**
 * remove a component from an entity
 * @param {string} name - the name of the component
 */
Entity.prototype.remove = function (name) {
  if (this.components[name] !== undefined) {
    var data = this.components[name];

    delete this.components[name];

    /**
     * report removal of components
     * @event
     * @param {string} name - name of the removed component
     * @param {object} data - data of the removed component
     */
    this.emit('remove', name, data);
  }
};

/**
 * test if a component exists in an entity
 * @param {string} name - the name of the component to test existence
 * @returns {boolean} - true if the entity has the desired components, false otherwise
 */
Entity.prototype.has = function (name) {
  return this.components[name] !== undefined;
};

// counter used to generate uid for this entity
Entity.prototype._count = 0;
/**
 * a system apply behavior on entities by updating components
 * @param {string} name - name of the system
 * @param {string[]|undefined} dependencies - array of required components. If
 * not specified or empty the system applies to all entities
 * @param {function} func - the function that should be applied to each
 * matching entity each turn
 * @constructor
 */
var System = function (name, dependencies, func) {
  /**
   * name of the system
   * @member {string}
   */
  this.name = name || "unnamed" + System.prototype._count;

  /**
   * array of components the entity depends on
   * @type {string[]}
   */
  this.dependencies = dependencies || [];

  /**
   * "system" function that is applied to all matching entity each ecs tick
   * @member {function}
   * @private
   */
  this._process = func;

  System.prototype._count++;
};

System.prototype.process = function (entity) {
  this._process(entity.id, entity.components, entity);
};

/**
 * global counter for systems names (in case its undefined)
 * @type {number}
 * @private
 */
System.prototype._count = 0;

/**
 * check if an entity met the component dependencies of the system
 * @param {Entity} entity - the entity to test
 * @return {boolean} - true if the entity met dependencies, false otherwise
 */
System.prototype.matchDependencies = function (entity) {
  // check for each component
  for (var i = 0; i < this.dependencies.length; i += 1) {
    var componentName = this.dependencies[i];

    if (!entity.components[componentName]) {
      return false;
    }
  }

  // A void array means the system should be applied to all entities
  return true;
};

/*global _getIndexByProperty */

/**
 * creates a new entity component system
 * @constructor
 * @fires ECS#addEntity
 * @fires ECS#removeEntity
 */
var ECS = function () {
  /**
   * list of entities
   * @member {array}
   */
  this.entities = [];

  /**
   * a dict of components schemas
   * @member {object}
   * @private
   */
  this._components = {};

  /**
   * a dict of entities schema
   * @member {object}
   * @private
   */
  this._entities = {};

  /**
   * list of systems
   * @member {System[]}
   * @private
   */
  this.systems = [];

  // make this object observable. Then it will broadcast entity changes
  // to make system update their entity list
  Observable.make(this);
};

/**
 * process a tick in current ecs
 */
ECS.prototype.tick = function () {
  var e = 0, s, ent, sys;

  for (; e < this.entities.length; e += 1) {
    ent = this.entities[e];

    for (s = 0; s < this.systems.length; s += 1) {
      sys = this.systems[s];

      // check if entity systems cache exists
      if (ent._systems[sys.name] === undefined) {
        ent._systems[sys.name] = sys.matchDependencies(ent);
      }

      // if entity should be processed, do it
      if (ent._systems[sys.name]) {
        sys.process(ent);
      }
    }
  }
};

/**
 * creates an entity
 *
 * @param {string|string[]} [arg] - create an entity with a set of default
 * components:
 * <br/>
 *   - string: the name of the entity schema. The schema must be registered with
 * {@link ECS#registerEntity} before.
 * <br/>
 *   - string[]: an array of components schemas names. The schemas must be
 * registered with {@link ECS#registerComponent} before.
 *
 * @returns {Entity} - the newly created entity
 */
ECS.prototype.createEntity = function (arg) {
  var ent = new Entity();

  if (arg) {
    var components = null, c = 0;

    if (typeof arg === "string") {
      // arg is the name of an entity schema
      var schema = this._entities[arg];

      if (schema) {
        components = schema;
      }
    } else {
      // arg is already an entity schema (list of components)
      components = arg;
    }

    // iterate over components list and clone schemas into real components
    for (; c < components.length; c += 1) {
      var name = components[c],
        data   = JSON.parse(JSON.stringify(this._components[name]));

      ent.update(name, data);
    }
  }

  return this.addEntity(ent);
};

/**
 * add an entity to the current ecs
 * @param {Entity} entity - the entity to add
 */
ECS.prototype.addEntity = function (entity) {
  // listen for entity events
  entity.on('add', this._onComponentAdd(entity));
  entity.on('update', this._onComponentUpdate(entity));
  entity.on('remove', this._onComponentRemove(entity));

  this.entities.push(entity);

  /**
   * add entity event
   * @event ECS#addEntity
   * @param {Entity} entity - added entity
   */
  this.emit('addEntity', entity);

  return entity;
};

/**
 * tests if an entity exists
 * @param {string|Entity} arg0 - the entity id if string<br/>
 * the entity instance if object
 * @returns {boolean} - true if the entity exists, false otherwise
 */
ECS.prototype.hasEntity = function (arg0) {
  var id = typeof arg0 === 'object' ? arg0.id : arg0;

  return _getIndexByProperty(this.entities, 'id', id) !== -1;
};

ECS.prototype.getEntity = function (arg0) {
  var id = typeof arg0 === 'object' ? arg0.id : arg0,
    ind  = _getIndexByProperty(this.entities, 'id', id);

  return this.entities[ind];
};

/**
 * remove an entity by id
 * @param {string|Entity} arg0 - the entity id if string<br/>
 * the entity instance if object
 */
ECS.prototype.removeEntity = function (arg0) {
  var id  = typeof arg0 === 'object' ? arg0.id : arg0,
    index = _getIndexByProperty(this.entities, 'id', id),
    ent   = null;

  if (index !== -1) {
    ent = this.entities.splice(index, 1)[0];

    /**
     * remove entity event
     * @event ECS#removeEntity
     * @param {Entity} entity - entity removed
     */
    this.emit("removeEntity", ent);
  }
};

/**
 * register a component schema to be used by entity factory
 * @param {string} name - the name of the schema
 * @param {object} defaults - an object containing the default
 * values, take the form of: <br/>
 * <pre>
 *   {
 *     property1: "value",
 *     property2: 123456
 *   }
 * </pre>
 */
ECS.prototype.registerComponent = function (name, defaults) {
  this._components[name] = defaults;
};

/**
 * create a new system. this function has two signatures: <br/>
 * <pre>
 *   var sys = ecs.createSystem(['cmp1', 'cmp2'], callback);
 *   console.log(sys.name); // 'unammed0'
 * </pre>
 * and the other one where you can specify a name:
 * <pre>
 *   var sys = ecs.createSystem('mySystem', ['cmp1', 'cmp2'], callback);
 *   console.log(sys.name); // 'mySystem'
 * </pre>
 * @param {string|string[]|function} arg0 -
 * <b>string</b>: the system name<br/>
 * <b>string[]</b>: the system dependencies<br/>
 * <b>function</b>: the function to apply to entities
 * @param {string[]|function} [arg1] -
 * <b>string[]</b>: the system dependencies<br/>
 * <b>function</b>: the function to apply to entities
 * @param {function} [arg2] -
 * <b>function</b>: the function to apply to entities
 */
ECS.prototype.createSystem = function (arg0, arg1, arg2) {
  var func  = typeof arg0 === 'function' ? arg0 : (typeof arg1 === 'function' ? arg1 : arg2),
    name    = typeof arg0 === 'string' ? arg0 : null,
    deps    = Array.isArray(arg0) ? arg0 : arg1,
    sys     = new System(name, deps, func);

  this.systems.push(sys);

  return sys;
};

/**
 * create a closure that broadcast an add event from an entity. The main goal
 * of this closure is to append the entity object in the event arguments
 * @param {Entity} entity - the entity
 * @returns {Function} - the created callback
 * @private
 */
ECS.prototype._onComponentAdd = function (entity) {
  var self = this;

  return function (name, data) {
    self._broadcast('componentAdd', [entity, name, data]);
  };
};

/**
 * create a closure that broadcast an update event from an entity. The main goal
 * of this closure is to append the entity object in the event arguments
 * @param {Entity} entity - the entity
 * @returns {Function} - the created callback
 * @private
 */
ECS.prototype._onComponentUpdate = function (entity) {
  var self = this;

  return function (name, data) {
    self._broadcast('componentUpdate', [entity, name, data]);
  };
};

/**
 * create a closure that broadcast a remove event from an entity. The main goal
 * of this closure is to append the entity object in the event arguments
 * @param {Entity} entity - the entity
 * @returns {Function} - the created callback
 * @private
 */
ECS.prototype._onComponentRemove = function (entity) {
  var self = this;

  return function (name, data) {
    self._broadcast('componentRemove', [entity, name, data]);
  };
};

/**
 * broadcast an event to all systems
 * @param {string} event - name of the event
 * @param {*} args - arguments of the event
 * @private
 */
ECS.prototype._broadcast = function (event, args) {
  // prepend event as the first argument
  args.unshift(event);

  this.emit.apply(this, args);
};

  // detect requirejs and define module if defined. Else check for commonjs
  // and define a module if defined. If not in requirejs or commonjs, add
  // "Observer" to the global object
  if (typeof window !== 'undefined' && typeof require === "function" &&
    typeof define === "function") {

    define([], function () {
      return ECS;
    });
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = ECS;
    root.ECS = ECS;
  } else {
    root.ECS = ECS;
  }
})(this);