var Observer = {},
  Observable = {};

// some shortcuts to call listeners
function callListeners(listeners) {
  for (var i = 0; i < listeners.length; i += 1) {
    listeners[i]();
  }
}

function callListenersWith1Args(listeners, arg0) {
  for (var i = 0; i < listeners.length; i += 1) {
    listeners[i](arg0);
  }
}

function callListenersWith2Args(listeners, arg0, arg1) {
  for (var i = 0; i < listeners.length; i += 1) {
    listeners[i](arg0, arg1);
  }
}

// make a object observable
Observer.make = function (o, unsafe) {
  var p;

  // check if we will override properties
  if (!unsafe) {
    for (p in Observable) {
      if (Observable.hasOwnProperty(p) && o.hasOwnProperty(p)) {
        throw Error("cannot override property");
      }
    }
  }

  // add required attributes and methods
  for (p in Observable) {
    if (Observable.hasOwnProperty(p)) {
      o[p] = Observable[p];
    }
  }

  o.__events = {};
};

// listen for an event
Observable.on = function (event, listener) {
  if (typeof listener !== 'function') {
    return;
  }

  if (!this.__events[event]) {
    this.__events[event] = [];
  }

  this.__events[event].push(listener);

  var self = this;

  return {
    dispose: function () {
      self.clear(event, listener);
    }
  };
};

// listen for an event, called only once
Observable.once = function (event, listener) {
  var self = this, ptr;

  ptr = this.on(event, function () {
    // no optimization here sincee it should be called once
    // todo: optimise the way of passing arguments
    var args = Array.prototype.slice.call(arguments);

    ptr.dispose();

    listener.apply(null, args);
  });
};

// emit an events
Observable.emit = function (event, arg0, arg1, arg2) {
  var listeners = this.__events[event];

  if (!listeners || !listeners.length) {
    return;
  }

  switch (arguments.length) {
    case 1: callListeners(listeners); break;
    case 2: 
      callListenersWith1Args(listeners, arg0);
      break;
    case 3: 
      callListenersWith2Args(listeners, arg0, arg1);
      break;
    default:
      console.error('cannot manage more arguments');
      break;
  }

};

// clear an event listener
Observable.clear = function (event, listener) {
  var listeners = this.__events[event];

  if (!listeners || !listeners.length) {
    return;
  }

  var index = listeners.indexOf(listener);

  if (index !== -1) {
    listeners.splice(index, 1);
  }
};