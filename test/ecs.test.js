
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

    it("should create an entity with an id", function () {
      var entity = ecs.createEntity(231);

      expect(entity).to.exist();
      expect(entity.id).to.be.equal(231);
    });


    it("should test if an entity exists", function () {
      var res = ecs.hasEntity(123);

      expect(res).to.be.equal(false);

      var entity = ecs.createEntity();

      res = ecs.hasEntity(entity.id);

      expect(res).to.be.equal(true);
    });

    it("should get an entity", function () {
      var res = ecs.getEntity(123);

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

    it("should flag removed entities", function () {
      var ent = ecs.createEntity();

      expect(ent.disposed).to.be.equal(false);

      ecs.removeEntity(ent.id);

      expect(ent.disposed).to.be.equal(true);
    });

    it("should emit an entity add event", function (done) {
      var ent;

      ecs.on('add', function (data) {
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

      ecs.on('remove', function (data) {
        expect(data.id).to.be.equal(ent.id);
        expect(ecs.hasEntity(data.id)).to.be.equal(false);

        done();
      });

      ecs.removeEntity(ent);
    });

    it("should create unique ids", function () {
      var ids = [], ent = null;

      for (var i = 0; i < 1000; i += 1) {
        ent = ecs.createEntity();

        expect(ids.indexOf(ent.id)).to.be.equal(-1, 'duplicate entity id at index ' + i);

        ids.push(ent.id);
      }
    });
  });

  describe("#isLocal()", function () {
    var ecs;

    beforeEach(function () {
      ecs = new ECS(123);
    });

    it("should return true if the id is a local one", function () {
      expect(ecs.isLocal(1123));
      expect(ecs.isLocal(456456123));
    });

    it("should return false if the id is not a local one", function () {
      expect(!ecs.isLocal(123124));
      expect(!ecs.isLocal(1124));
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

    it("should throw an error if component schema is missng", function () {
      expect(function () {
        ecs.createEntity(['component']);
      }).to.throw(Error);
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

    it("should not remove an entity when a component is removed", function () {
      var ent = ecs.createEntity();

      ent.update('cmp', {
        hello: 'world'
      });

      ent.remove('cmp');

      expect(ecs.hasEntity(ent.id)).to.be.equal(true);
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