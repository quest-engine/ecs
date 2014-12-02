
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
});