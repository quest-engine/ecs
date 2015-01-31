
/*global beforeEach*/

describe("ECS", function () {
  describe('#constructor', function () {
    it("should create an ecs", function () {
      var ecs = new ECS();

      expect(ecs).to.exist();
    });
  });

  describe('#entities', function () {
    var ecs;

    beforeEach(function () {
      ecs = new ECS();
    });

    it("should create an entity", function () {
      var entity = ecs.createEntity();

      expect(entity).to.exist();
      expect(entity.id).to.exist();
    });

    it("should test if an entity exists", function () {
      var res = ecs.hasEntity('someid');

      expect(res).to.be.equal(false);

      var entity = ecs.createEntity();

      res = ecs.hasEntity(entity.id);

      expect(res).to.be.equal(true);
    });

    it("should get an entity", function () {
      var res = ecs.getEntity('someid');

      expect(res).to.be.equal(undefined);

      var entity = ecs.createEntity();

      res = ecs.getEntity(entity.id);

      expect(res).to.be.an('object');
    });

    it("should remove an entity", function () {
      var ent = ecs.createEntity();

      expect(ecs.hasEntity(ent.id)).to.be.equal(true);

      ecs.removeEntity(ent.id);

      expect(ecs.hasEntity(ent.id)).to.be.equal(false);
    });

    it("should emit an entity add event", function (done) {
      var ent;

      ecs.on('addEntity', function (data) {
        expect(data.id).to.be.equal(ent.id);

        done();
      });

      // we create the instance and add it to the ecs after entity.id is
      // properly initialized
      ent = new Entity();
      ecs.addEntity(ent);
    });

    it("should emit an entity remove event", function (done) {
      var ent = ecs.createEntity();

      ecs.on('removeEntity', function (data) {
        expect(data.id).to.be.equal(ent.id);
        expect(ecs.hasEntity(data.id)).to.be.equal(false);

        done();
      });

      ecs.removeEntity(ent);
    });
  });

  describe("#components", function () {
    var ecs;

    beforeEach(function () {
      ecs = new ECS();
    });

    it("should register a component schema", function () {
      ecs.registerComponent('component', {
        value: 'default'
      });

      var ent = ecs.createEntity(['component']);

      expect(ent.has('component')).to.be.equal(true);
      expect(ent.components.component).to.be.deep.equal({
        value: 'default'
      });
    });

    //todo: better name
    it("should isolate components", function () {
      ecs.registerComponent('component', {
        value: 'default'
      });

      var ent1 = ecs.createEntity(['component']);
      var ent2 = ecs.createEntity(['component']);

      ent2.update('component', {
        value: 'hello'
      });

      expect(ent1.components.component).to.be.deep.equal({
        value: 'default'
      });

      expect(ent2.components.component).to.be.deep.equal({
        value: 'hello'
      });
    });

    it("should emit an event when a component is added", function (done) {
      ecs.on("componentAdd", function (entity, name) {
        expect(entity.id).to.be.a('string');
        expect(name).to.be.equal('cmp');

        done();
      });

      var ent = ecs.createEntity();
      ent.update('cmp', {
        hello: 'world'
      });
    });

    it("should emit an event when a component is updated", function (done) {
      ecs.on("componentUpdate", function (entity, name, data) {
        expect(entity.id).to.be.a('string');
        expect(name).to.be.equal('cmp');
        expect(data).to.be.deep.equal({
          hello: 'universe'
        });

        done();
      });

      var ent = ecs.createEntity();

      ent.update('cmp', {
        hello: 'world'
      });

      ent.update('cmp', {
        hello: 'universe'
      });
    });

    it("should emit an event when a component is removed", function (done) {
      ecs.on("componentRemove", function (entity, name) {
        expect(entity.id).to.be.a('string');
        expect(name).to.be.equal('cmp');

        done();
      });

      var ent = ecs.createEntity();

      ent.update('cmp', {
        hello: 'world'
      });

      ent.remove('cmp');
    });
  });

  describe('#system', function () {
    var ecs, e;

    beforeEach(function () {
      ecs = new ECS();

      System.prototype._count = 0;

      // fake entity
      e = {
        components: {
          c: {count: 0}
        }
      };
    });

    it("should create a system (1 arg signature)", function () {
      var sys = ecs.createSystem(function (name, components) {});

      expect(sys.name).to.be.equal('unnamed0');
      expect(sys.dependencies.length).to.be.equal(0);
    });

    it("should create a system (2 args signature)", function () {
      var sys = ecs.createSystem(['c'], function (name, components) {});

      expect(sys.name).to.be.equal('unnamed0');
      expect(sys.dependencies.length).to.be.equal(1);
    });

    it("should create a system (3 args signature)", function () {
      var sys = ecs.createSystem('sys', ['c'], function (name, components) {});

      expect(sys.name).to.be.equal('sys');
      expect(sys.dependencies.length).to.be.equal(1);
    });

    it("should process an entity", function () {
      var sys = ecs.createSystem(function (name, components) {
        components.c.count += 1;
      });

      sys.process(e);

      expect(e.components.c.count).to.be.equal(1);
    });

    it("should process an entity according to dependencies", function () {
      ecs.createSystem(function (name, components) {
        components.c.count += 1;
      });

      var ent = ecs.createEntity();

      ent.update('c', {
        count: 0
      });

      ecs.tick();

      expect(ent.components.c.count).to.be.equal(1);
    });
  });
});