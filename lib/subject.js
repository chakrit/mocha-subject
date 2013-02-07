
// subject.js - Subject-style setups/teardowns.
module.exports = (function() {
  "use strict";

  var assert = require('assert')
    , path = require('path')
    , $S = { }; // main exports

  // ---

  // ## _infections list

  // Array of function names to adds to `global` when `infect()` is called.
  $S._infections = 'subject,property'.split(',');

  // ---

  // ## before() and after() hook

  // Defaults to `global.before` and `global.after` which should have been added by
  // mocha. This is provided in case you want to override the behavior of the `before()`
  // and `after()` hook used by mocha-subject.
  $S._before = global.before;
  $S._after = global.after;

  // ---

  // ## infect()

  // Adds `subject()` and `property()` method to global scope so it can be used without
  // referencing mocha-subject.
  $S.infect = function() {
    for (var i = 0; i < $S._infections.length; i++)
      global[$S._infections[i]] = $S[$S._infections[i]];
  };

  // ---

  // ## disinfect()

  // Removes all functions added by `infect()` from global scope.
  $S.disinfect = function() {
    for (var i = 0; i < $S._infections.length; i++)
      delete global[$S._infections[i]];
  };

  // ---

  // ## subject( name, object )

  // Adds the given `object` to current mocha test context using the specified name in a
  // `before` hook and removes it afterwards in an `after` hook.
  $S.subject = function(name, object) {
    assert(typeof name === 'string', 'name argument missing or not a string');
    assert(typeof object !== 'undefined', 'object argument is undefined');

    $S._before(function() {
      this[name] = object;

      // TODO: Is there a way to track subjects hierarchy without modifying the context?
      //   storing states ourselves is probably not a good idea.
      if (!this.__subjects) {
        Object.defineProperty(this, '__subjects',
          { enumerable: false
          , configurable: true // required for delete
          , value: [] });
      }

      this.__subjects.push(object);
    });

    $S._after(function() {
      delete this[name];

      this.__subjects.pop();
      if (!this.__subjects.length) {
        delete this.__subjects;
      }
    });
  };

  // ---

  // ## property( name, [key] )

  // Take property `name` from the nearest subject object and adds it to current mocha
  // test context using the specified `key` (or the same name as the property if `key` is
  // not specified.)
  $S.property = function(name, contextKey) {
    assert(typeof name === 'string', 'name argument missing or not a string');

    if (typeof contextKey === 'undefined') contextKey = name;
    assert(typeof contextKey === 'string', 'contextKey argument not a string');

    $S._before(function() {
      var subject = this.__subjects[this.__subjects.length - 1];

      this[contextKey] = subject[name];
    });

    $S._after(function() { delete this[contextKey]; });
  };

  // ---

  return $S;

})();
