// observer.js, a simple simple to make your object evented
(function (global) {
  "use strict";

  // `window` in the browser or `global` on node
  var root = typeof window !== 'undefined' ? window : global;

  

  // detect requirejs and define module if defined. Else check for commonjs
  // and define a module if defined. If not in requirejs or commonjs, add
  // "Observer" to the global object
  if (typeof window !== 'undefined' && typeof require === "function" &&
    typeof define === "function") {

    define([], function () {
      return ECS;
    });
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = ECS;
    root.ECS = ECS;
  } else {
    root.ECS = ECS;
  }
})(this);