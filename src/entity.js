/**
 * an entity objects which has an unique id and a collection of components
 * @constructor
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

  Entity.prototype._count += 1;
};

Entity.Message = {};

Entity.Message.ComponentAdd = 0;
Entity.Message.ComponentRemove = 1;

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
  } else {
    // if the component does not exists, add it silently
    this.components[name] = data;

    // todo: uncomment when emit will be available
    /*this.emit(Entity.Message.ComponentAdd, {
      name: name,
      data: data
    });*/
  }
};

// counter used to generate uid for this entity
Entity.prototype._count = 0;