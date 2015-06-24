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
