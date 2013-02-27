
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

  // ## _before( func ) and _after( func ) hook

  // Helper function that adds the supplied function to the `before()` and `after()` hook
  // provided by mocha. This is provided in case you want to override the behavior of the
  // `before()` and `after()` hook that is used by mocha-subject.
  //
  // **NOTE:** Mocha rebuilds its `before()` and `after()` function after every test run
  // so you must take care not to capture these variables and re-use it across different
  // run of the test because it will produce unpredictable result. These two functions
  // also helps in this regard. (Re-retreiving the value of `global.before` and
  // `global.after` hook after every run.)
  $S._before = function(func) { return global.before(func); };
  $S._after = function(func) { return global.after(func); };

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

  // ## subject( name, factory )

  // Use the given `factory` function to create an object and adds it to current mocha
  // test context using the specified name in a `before` hook and removes it afterwards
  // automatically in an `after` hook.
  $S.subject = function(name, factory) {
    assert(typeof name === 'string', 'name argument missing or not a string');
    assert(typeof factory === 'function', 'factory argument missing or not a string');

    // TODO: Support async before/after function(done) style.
    $S._before(function() {
      var info =
        { name: name
        , factory: factory
        , instance: factory.call(this)
        };

      // TODO: Is there a way to track subjects hierarchy without modifying the context?
      //   storing states ourselves is probably not a good idea.
      if (!this.__subjects) {
        Object.defineProperty(this, '__subjects',
          { enumerable: false
          , configurable: true // required for delete
          , value: [] });
      }

      this[name] = info.instance;
      this.__subjects.push(info);
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
      this[contextKey] = subject.instance[name];
    });

    $S._after(function() { delete this[contextKey]; });
  };

  // ---

  return $S;

})();
