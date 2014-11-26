
/*global describe, it, Class, expect */

describe("Class", function() {
  "use strict";

  it("should expose class object", function () {
    if (!Class) {
      throw Error('Class does not exists');
    }
  });

  it("should have an extend method", function () {
    if (!Class.extend) {
      throw Error('expected extend method on Class object');
    }
  });

  var C1 = Class.extend({
    init: function (arg) {
      this.p1 = arg;
    },
    setP: function (p1) {
      this.p1 = p1;
    },
    useless: function (arg) {
      this.value = arg;
    }
  });

  var C2 = C1.extend({
    init: function (arg) {
      this._super(arg);

      this.p2 = arg;
    },
    setP: function (p1) {
      this._super(p1);

      this.p2 = p1;
    }
  });

  it("should have a constructor with arguments", function () {
    var c = new C1('test');

    expect(c.p1).to.be.equal('test');
  });

  it("should have member methods", function () {
    var c = new C1();

    c.setP('foo');

    expect(c.p1).to.be.equal('foo');
  });

  it("can call super constructor", function () {
    var c = new C2('test');

    expect(c.p1).to.be.equal('test');
    expect(c.p2).to.be.equal('test');
  });

  it("can override methods", function () {
    var c = new C2('test');

    c.setP('test2');

    expect(c.p1).to.be.equal('test2');
    expect(c.p2).to.be.equal('test2');
  });

  it("can access parent methods", function () {
    var c = new C2('test');

    c.useless('test');

    expect(c.value).to.be.equal('test');
  });
});