
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
    ent.emit('removeEntity');
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