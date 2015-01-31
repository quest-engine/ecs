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