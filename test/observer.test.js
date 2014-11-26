
/*global describe, it, before, expect, beforeEach, Observer */

describe("Observer", function() {
  "use strict";

  it("should exists", function () {
    if (!Observer) {
      throw Error('Observer does not exists');
    }
  });

  describe('instance', function () {
    var obj;

    beforeEach(function () {
      obj = new Observer();
    });

    it("should declare a callback", function (done) {
      obj.on('event', done);

      obj.trigger('event');
    });

    it("should call the callback multiple times", function(done) {
      var c = 0;

      // called once an event is triggered
      function jobDone() {
        c += 1;

        if (c === 3) {
          done();
        }
      }

      obj.on('event', jobDone);

      obj.trigger('event');
      obj.trigger('event');
      obj.trigger('event');
    });

    it("should call multiple callbacks", function(done) {
      var c = 0;

      // called once an event is triggered
      function jobDone() {
        c += 1;

        if (c === 3) {
          done();
        }
      }

      obj.on('event', jobDone);
      obj.on('event', jobDone);
      obj.on('event', jobDone);

      obj.trigger('event');
    });

    it("should give trigger arguments to callback", function (done) {
      obj.on('event', function (a, b) {
        expect(a).to.be.equal('test');
        expect(b).to.be.equal(3);

        done();
      });

      obj.trigger('event', 'test', 3);
    });

    it("should clear the trigger", function (done) {
      var called = false, ptr;

      ptr = obj.on('event', function () {
        obj.clear(ptr);

        setTimeout(function () {
          done();
        }, 1);

        obj.trigger('event');
      });

      obj.trigger('event');
    });

    it("should handle different event types", function (done) {
      var t1 = false, t2 = false;

      function check() {
        if (t1 && t2) {
          done();
        }
      }

      obj.on("e1", function () {
        t1 = true;
        check();
      });

      obj.on("e2", function () {
        t2 = true;
        check();
      });

      obj.trigger("e1");
      obj.trigger("e2");
    });
  });
});