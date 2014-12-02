
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

  // make this object observable. Then it will broadcast entity changes
  // to make system update their entity list
  Observable.make(this);
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
        data   = this._components[name];

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