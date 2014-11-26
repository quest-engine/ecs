ecs
===

The entity-component-system framework for Javascript.

## Install

For client side, use bower (or download sources in `dist/` folder) :
```bash
bower install --save ecs
```

For server side, use npm :
```bash
npm install --save ecs
```

## Integrate ecs in your project

In vanilla Javascript `ecs` will be available through global `ECS` variable.

`ecs` will try to detect the frameworks used. For instance if you use `requirejs`, `ecs` will not expose its methods to the global scope but instead will register as a `requirejs` module. The same behavior is applied when `angularjs` is detected.

This behavior does not apply to server-side.

## Getting started

> An `entity` is no more than a wrapper around an `id` which is unique and a set of `components`. `systems` bring life to the whole by applying behaviors depending of the components of an `entity`.

For more informations, see the [entity component system](http://en.wikipedia.org/wiki/Entity_component_system) page on wikipedia.

