
/*global describe, it, before, expect, beforeEach, Component */

describe("Component", function() {
  "use strict";

  it("should expose an component object", function () {
    if (!Component) {
      throw new Error("Component object undefined");
    }
  });

  describe("instance", function () {
    var c;

    it("should initialize with data", function () {
      c = new Component({
        x: 0,
        y: 0
      });

      expect(c.x).to.be.equal(0);
      expect(c.y).to.be.equal(0);
    });

    describe("#update", function () {
      var c;

      beforeEach(function () {
        c = new Component({
          x: 0,
          y: 0
        });
      });

      it("should update a component", function () {
        c.update({
          x: 1,
          y: 1
        });

        expect(c.x).to.be.equal(1);
        expect(c.y).to.be.equal(1);
      });

      it("should update a component partially", function () {
        c.update({
          x: 1
        });

        expect(c.x).to.be.equal(1);
        expect(c.y).to.be.equal(0);
      });
    });
  });
});