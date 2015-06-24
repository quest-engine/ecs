
describe("Entity", function () {
  describe("#updateComponent", function () {
    var ent;

    beforeEach(function () {
      ent = new Entity();
    });

    it("should update a component (2 args)", function () {
      ent.update('cmp', {hello: 'world'});

      expect(ent.components.cmp).to.be.deep.equal({hello: 'world'});
    });

    it("should update a component (1 arg)", function () {
      ent.update({
        cmp: {hello: 'world'}
      });

      expect(ent.components.cmp).to.be.deep.equal({hello: 'world'});
    });

    it("should update multiple components", function () {
      ent.update({
        cmp1: {hello: 'world'},
        cmp2: {foo: 'bar'}
      });

      expect(ent.components.cmp1).to.be.deep.equal({hello: 'world'});
      expect(ent.components.cmp2).to.be.deep.equal({foo: 'bar'});
    });

    it("should emit an event when a component is added", function (done) {
      ent.on('addComponent', function (name, data) {
        expect(name).to.be.equal('cmp');
        expect(data.hello).to.be.equal('world');

        done();
      });

      ent.update('cmp', {
        hello: 'world'
      });
    });
  });

  describe("removeComponent", function () {
    var ent;

    beforeEach(function () {
      ent = new Entity();

      ent.update('cmp', {
        hello: 'world'
      });
    });

    it("should remove a component", function () {
      ent.remove('cmp');

      expect(ent.has('cmp')).to.be.equal(false);
    });

    it("should emit an event when a component is removed", function (done) {
      ent.on('removeComponent', function (name, data) {
        expect(name).to.be.equal('cmp');
        expect(data).to.be.deep.equal({
          hello: 'world'
        });

        done();
      });

      ent.remove('cmp');
    });
  });
});