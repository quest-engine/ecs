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

### Simple example

TODO

## Hack on ecs

### Git

[Gitflow workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow) is used for branching.

Ecs follows [Git commit messages convention](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit) used by Angular team.

### Build

This project uses gulp to :

 * Validate code
 * Concat/uglify code
 * Produce `demo/` and `dist/` folders
 * Continuous tests run
 * Several other utilities such as bumping versions

See commands for the full set of commands.

### Test driven development

All code must be tested with `karma`, `mocha` and `chai`. It is highly recommended to adopt a [TDD](http://en.wikipedia.org/wiki/Test-driven_development) approach.

### Rules

* No external dependency is allowed
* All code must be validated with `jshint`, see gulp commands
* Commit messages and branching must respect the conventions
