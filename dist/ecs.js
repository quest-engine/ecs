// observer.js, a simple simple to make your object evented
(function (global) {
  "use strict";

  // `window` in the browser or `global` on node
  var root = typeof window !== 'undefined' ? window : global;

  var Observer = {},
  Observable = {};

// some shortcuts to call listeners
function callListeners(listeners) {
  for (var i = 0; i < listeners.length; i += 1) {
    listeners[i]();
  }
}

function callListenersWith1Args(listeners, arg0) {
  for (var i = 0; i < listeners.length; i += 1) {
    listeners[i](arg0);
  }
}

function callListenersWith2Args(listeners, arg0, arg1) {
  for (var i = 0; i < listeners.length; i += 1) {
    listeners[i](arg0, arg1);
  }
}

// make a object observable
Observer.make = function (o, unsafe) {
  var p;

  // check if we will override properties
  if (!unsafe) {
    for (p in Observable) {
      if (Observable.hasOwnProperty(p) && o.hasOwnProperty(p)) {
        throw Error("cannot override property");
      }
    }
  }

  // add required attributes and methods
  for (p in Observable) {
    if (Observable.hasOwnProperty(p)) {
      o[p] = Observable[p];
    }
  }

  o.__events = {};
};

// listen for an event
Observable.on = function (event, listener) {
  if (typeof listener !== 'function') {
    return;
  }

  if (!this.__events[event]) {
    this.__events[event] = [];
  }

  this.__events[event].push(listener);

  var self = this;

  return {
    dispose: function () {
      self.clear(event, listener);
    }
  };
};

// listen for an event, called only once
Observable.once = function (event, listener) {
  var self = this, ptr;

  ptr = this.on(event, function () {
    // no optimization here sincee it should be called once
    // todo: optimise the way of passing arguments
    var args = Array.prototype.slice.call(arguments);

    ptr.dispose();

    listener.apply(null, args);
  });
};

// emit an events
Observable.emit = function (event, arg0, arg1, arg2) {
  var listeners = this.__events[event];

  if (!listeners || !listeners.length) {
    return;
  }

  switch (arguments.length) {
    case 1: callListeners(listeners); break;
    case 2: 
      callListenersWith1Args(listeners, arg0);
      break;
    case 3: 
      callListenersWith2Args(listeners, arg0, arg1);
      break;
    default:
      console.error('cannot manage more arguments');
      break;
  }

};

// clear an event listener
Observable.clear = function (event, listener) {
  var listeners = this.__events[event];

  if (!listeners || !listeners.length) {
    return;
  }

  var index = listeners.indexOf(listener);

  if (index !== -1) {
    listeners.splice(index, 1);
  }
};
/**
 * an entity objects which has an unique id and a collection of components
 * @constructor
 * @fires Entity#add
 * @fires Entity#update
 * @fires Entity#remove
 */
var Entity = function (id) {
  /**
   * unique id of the entity
   * @member {Number}
   * */
  this.id = id;

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
  Observer.make(this);
};

// Instance variables
Entity.prototype.disposed = false;

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
    var e;

    // apply new properties
    for (e in data) {
      if (data.hasOwnProperty(e)) {
        component[e] = data[e];
      }
    }    
  } else {
    // if the component does not exists, add it silently
    this.components[name] = data;

    // reset the system cache
    this._systems = {};

    /**
     * report components added
     * @event Entity#add
     * @param {string} name - name of the added component
     * @param {object} data - data of the added component
     */
    this.emit('addComponent', name, data);
  }
};

/**
 * remove a component from an entity
 * @param {string} name - the name of the component
 */
Entity.prototype.remove = function (name) {
  if (this.components[name] !== undefined) {
    var data = this.components[name];

    this.components[name] = undefined;

    // remove the system matching cache because we removed a components
    this._systems = {};

    /**
     * report removal of components
     * @event
     * @param {string} name - name of the removed component
     * @param {object} data - data of the removed component
     */
    this.emit('removeComponent', name, data);
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

var MAX_SALTS = 1000;

/**
 * creates a new entity component system
 * @constructor
 * @fires ECS#addEntity
 * @fires ECS#removeEntity
 */
var ECS = function (salt) {
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

  /**
   * "salt" used to generate unique entity ids accros multiple instances
   * @type {Number}
   */
  this.salt = salt || 0;

  // make this object observable. Then it will broadcast entity changes
  // to make system update their entity list
  Observer.make(this);
};

ECS.prototype.isLocal = function (entityId) {
  var localId = Math.floor(entityId / MAX_SALTS);

  return this.salt === entityId % localId;
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
ECS.prototype.createEntity = function (arg0, arg1) {
  var arg = arg1 || typeof arg0 === 'number' ? arg1 : arg0, id = null;

  if (arg1 || typeof arg0 === 'number') {
    id = arg0;
  } else {
    id = this.salt + (MAX_SALTS * _nextUid());  
  }  

  var ent = new Entity(id);

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
      var name = components[c];

      if (!this._components[name]) {
        throw new Error('no component schema \'' + name + '\'');
      }

      var data = JSON.parse(JSON.stringify(this._components[name]));

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
  this.entities.push(entity);

  /**
   * add entity event
   * @event ECS#addEntity
   * @param {Entity} entity - added entity
   */
  this.emit('add', entity);

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

    ent.disposed = true;

    /**
     * remove entity event
     * @event ECS#removeEntity
     * @param {Entity} entity - entity removed
     */
    this.emit('remove', ent);
    ent.emit('remove');
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