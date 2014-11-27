
/*global Component, Entity, System */

var ECS = {
  Entity: Entity,
  entities: [],
  Component: Component,
  System: System,
  systems: [],
  tick: tick
};

function tick() {
  "use strict";

  var i, e, sys, ent;

  for (e = 0; e < ECS.entities.length; e += 1) {
    ent = ECS.entities[e];

    for (i = 0; i < ECS.systems.length; i += 1) {
      sys = ECS.systems[i];

      if (sys.shouldProcess(ent)) {
        sys.tick(ent);
      }
    }
  }
}