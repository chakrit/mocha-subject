
// subject.js - Subject-style setups/teardowns.
module.exports = (function() {
  "use strict";

  var assert = require('assert')
    , path = require('path');

  // ### Global imports
  // 
  // So we can hook into mocha's `before` and `after` hooks.
  var before = global.before
    , after = global.after;

  // # Mocha-Subject exports
  var $S = { };

  // TODO:
  // * Automatic require() via some module magic?

  // ### subject() setup
  // 
  // Adds an object to current mocha context using the spcified name in a `before` hook
  // and deletes in afterwards in an `after` hook.
  $S.subject = function(name, object) {
    assert(typeof name === 'string', 'name argument missing or not a string');
    assert(typeof object !== 'undefined', 'object argument is undefined');

    before(function() {
      this[name] = object;

      // TODO: Is there a way to track subjects hierarchy without modifying the context?
      //   storing the states ourself? good idea?
      if (!this.__subjects) {
        Object.defineProperty(this, '__subjects',
          { enumerable: false
          , configurable: true // required for delete
          , value: [] });
      }

      this.__subjects.push(object);
    });

    after(function() {
      delete this[name];

      this.__subjects.pop();
      if (!this.__subjects.length) {
        delete this.__subjects;
      }
    });
  };

  // ### property() setup
  // 
  // Adds an object taken from the specified property of the previous subject object to
  // the current mocha context using the property name as key.
  $S.property = function(name, contextKey) {
    assert(typeof name === 'string', 'name argument missing or not a string');

    if (typeof contextKey === 'undefined') contextKey = name;
    assert(typeof contextKey === 'string', 'contextKey argument not a string');

    before(function() {
      var subject = this.__subjects[this.__subjects.length - 1];

      this[contextKey] = subject[name];
    });

    after(function() { delete this[contextKey]; });
  };

  return $S;

})();
