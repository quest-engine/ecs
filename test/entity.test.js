
describe("Entity", function () {
  describe("#constructor", function () {
    it("should create unique identifiers", function () {
      var ids = [], ent = null;

      for (var i = 0; i < 200; i += 1) {
        ent = new Entity();

        expect(ids.indexOf(ent.id)).to.be.equal(-1, 'duplicate entity id');

        ids.push(ent.id);
      }
    });
  });

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
      ent.on('add', function (name, data) {
        expect(name).to.be.equal('cmp');
        expect(data.hello).to.be.equal('world');

        done();
      });

      ent.update('cmp', {
        hello: 'world'
      });
    });

    it("should emit an event when a component is updated", function (done) {
      ent.update('cmp', {
        foo: 'bar',
        hello: 'world'
      });

      ent.on('update', function (name, data, updated) {
        expect(name).to.be.equal('cmp');
        expect(updated).to.be.deep.equal({
          hello: 'universe'
        });
        expect(data).to.be.deep.equal({
          foo: 'bar',
          hello: 'universe'
        });

        done();
      });

      ent.update('cmp', {
        hello: 'universe'
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
      ent.on('remove', function (name, data) {
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