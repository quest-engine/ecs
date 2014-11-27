
/*global ECS, describe, it */

describe("ECS", function () {
  "use strict";

  it("should expose a global ECS object", function () {
    if (!ECS) {
      throw new Error();
    }
  });

  it("should have Entity", function () {
    if (!ECS.Entity) {
      throw new Error();
    }
  });

  it("should have System", function () {
    if (!ECS.System) {
      throw new Error();
    }
  });

  it("should have Component", function () {
    if (!ECS.Component) {
      throw new Error();
    }
  });
});