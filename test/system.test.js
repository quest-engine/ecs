
/*global describe, it, beforeEach, ECS, expect */

describe("System", function () {
  "use strict";

  var sys, System = ECS.System;

  it("should tick a system", function () {
    var MySystem = System.extend({
      init: function () {
        this._super();
      },
      tick: function (entities) {
        this.ticked = true;
      }
    });

    sys = new MySystem();

    ECS.systems = [sys];

    ECS.tick();

    expect(sys.ticked).to.be.equal(true);
  });
});