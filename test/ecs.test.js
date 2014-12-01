
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
  });

  describe("#components", function () {
    beforeEach(function () {

    });
  });
});