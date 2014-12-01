/**
 * creates a new entity component system
 * @constructor
 */
var ECS = function () {
  this.entities = [];

};

/**
 * creates an entity
 * @param {string} [type] - type of the entity. If supplied, the entity is
 *   created with a list of default components
 * @returns {Entity} - the newly created entity
 */
ECS.prototype.createEntity = function (type) {
  var ent = new Entity();

  this.entities.push(ent);

  return ent;
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
    index = _getIndexByProperty(this.entities, 'id', id);

  if (index !== -1) {
    this.entities.splice(index, 1);
  }
};