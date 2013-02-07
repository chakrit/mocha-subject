
// test/subject-infection.js - Test subject.js infect/disinfect functionality.
(function() {

  var _ = require('underscore')
    , assert = require('chai').assert
    , subject = require('../lib/subject');

  describe('Mocha-subject', function() {
    // after(function() { subject.disinfect(); });

    describe('infect() function', function() {
      it('should be exported', function() {
        assert.typeOf(subject.infect, 'function');
      });
    });

    describe('disinfect() function', function() {
      it('should be exported', function() {
        assert.typeOf(subject.disinfect, 'function');
      });
    });

    describe('inside an infected scope', function() {
      before(function() { subject.infect(); });
      after(function() { subject.disinfect(); });

      subject._infections.forEach(function(infection) {
        it('should be able to access the `' + infection + '` function globally', function() {
          assert.typeOf(global[infection], 'function');
        });
      });
    });

    describe('after infected scope', function() {
      subject._infections.forEach(function(infection) {
        it('should not be able to find `' + infection + '` function in global scope', function() {
          assert.isUndefined(global[infection]);
        });
      });
    });
  });

})();
