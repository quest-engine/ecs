
/*global describe, it, before, expect, beforeEach, Entity, Component */

describe("Entity", function() {
  "use strict";

  it("should expose an entity object", function () {
    if (!Entity) {
      throw new Error("Entity object undefined");
    }
  });

  describe("instance", function () {
    var ent;

    it("should initialize with components", function () {
      ent = new Entity({
        pos: {
          x: 0,
          y: 0
        }
      });

      expect(ent.cmp.pos).to.deep.equal({
        x: 0,
        y: 0
      });
    });

    it("should initialize with an uid", function () {
      var e1 = new Entity(),
          e2 = new Entity();

      expect(e1.id).to.be.a('string');
      expect(e2.id).to.be.a('string');
      expect(e1.id).to.not.equal(e2.id);
    });

    describe("#addComponents", function () {
      beforeEach(function () {
        ent = new Entity();
      });

      it("should add a component (2 parameters syntax)", function () {
        ent.component('pos', {
          x: 0,
          y: 0
        });

        expect(ent.cmp.pos).to.deep.equal({
          x: 0,
          y: 0
        });
      });

      it("should add a component (1 parameter syntax)", function () {
        ent.update({pos: {
          x: 0,
          y: 0
        }});

        expect(ent.cmp.pos).to.deep.equal({
          x: 0,
          y: 0
        });
      });

      it("should add multiple components (1 parameter syntax)", function () {
        ent.update({
          pos: {
            x: 0,
            y: 0
          },
          meta: {
            name: 'test'
          }
        });

        expect(ent.cmp.pos).to.deep.equal({
          x: 0,
          y: 0
        });

        expect(ent.cmp.meta).to.deep.equal({
          name: 'test'
        });
      });
    });

    describe("#updateComponents", function () {
      beforeEach(function () {
        ent = new Entity({
          pos: {
            x: 0,
            y: 0
          },
          meta: {
            name: 'test'
          }
        });
      });

      it("should update one component (2 parameters syntax)", function () {
        ent.component('pos', {
          x: 0,
          y: 1
        });

        expect(ent.cmp.pos).to.deep.equal({
          x: 0,
          y: 1
        });
      });

      it("should add a component property (2 parameters syntax)", function () {
        ent.component('meta', {
          age: 20
        });

        expect(ent.cmp.meta).to.deep.equal({
          name: 'test',
          age: 20
        });
      });

      it("should update multiple components", function () {
        ent.update({
          pos: {x: 20},
          meta: {name: 'hello'}
        });

        expect(ent.cmp.pos).to.deep.equal({x: 20, y: 0});
        expect(ent.cmp.meta).to.deep.equal({name: 'hello'});
      });
    });

    describe("#componentsObjects", function () {
      var PosComponent = Component.extend({
        init: function (data) {
          this._super(data || {
            x: 0,
            y: 0
          });
        }
      });

      PosComponent.prototype.name = 'pos';

      beforeEach(function () {
        ent = new Entity();
      });

      it("should add a position component with default values", function () {
        ent.addComponent(new PosComponent());

        expect(ent.cmp.pos).to.exist();
        expect(ent.cmp.pos.x).to.be.equal(0);
        expect(ent.cmp.pos.y).to.be.equal(0);
      });

      it("should partially update a component object", function () {
        ent.addComponent(new PosComponent());

        ent.updateComponent(PosComponent, {
          x: 1
        });

        expect(ent.cmp.pos.x).to.be.equal(1);
        expect(ent.cmp.pos.y).to.be.equal(0);
      });

      it("should add and remove a component", function () {
        ent.addComponent(new PosComponent());

        expect(ent.cmp.pos).to.exist();

        ent.removeComponent(PosComponent);

        expect(ent.cmp.pos).to.not.exist();
      });
    });
  });
});