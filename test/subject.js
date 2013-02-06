
// test/subject.js - Test subject.js
(function() {

  var _ = require('underscore')
    , assert = require('chai').assert
    , spy = require('sinon').spy
    , subject = require('../lib/subject');

  var NON_STRINGS = [123, { }, []]
    , TEST_OBJECT = { testProperty: 'value' }
    , TEST_OBJECT2 = { testProperty2: 'value2' };


  describe('Mocha-subject', function() {

    describe('require function', function() {
      it('should be exported', function() {
        assert.typeOf(subject.require, 'function');
      });
    });

    describe('subject() function', function() {
      it('should be exported', function() {
        assert.typeOf(subject.subject, 'function');
      });

      it('should throws if `name` argument is missing or not a string', function() {
        [123, { }, null, undefined, []].forEach(function(thing) {
          assert.throws(function() { subject.subject(thing); }, /name/i);
        });
      });

      it('should throws if `object` argument not provided', function() {
        assert.throws(function() { subject.subject('name'); }, /object/i);
      });

      describe('simple object subject', function() {
        describe('in test context', function() {
          subject.subject('subject', TEST_OBJECT);

          it('should adds object to the context', function() {
            assert.equal(this['subject'], TEST_OBJECT);
          });

          it('should adds a non-enumerable __subjects array to the context', function() {
            assert.instanceOf(this.__subjects, Array);
          });

          it('should adds object to the end of the __subjects array', function() {
            assert.equal(this.__subjects[this.__subjects.length - 1], TEST_OBJECT);
          });

          describe('nested within another object context', function() {
            subject.subject('subject2', TEST_OBJECT2);

            it('should adds nested object to the context', function() {
              assert.equal(this['subject2'], TEST_OBJECT2);
            });

            it('parent subject object should still be accessible', function() {
              assert.equal(this['subject'], TEST_OBJECT);
            });

            it('should adds nested object to the end of the __subjects array', function() {
              assert.equal(this.__subjects[this.__subjects.length - 1], TEST_OBJECT2);
            });
          });

          describe('after leaving nested context', function() {
            it('should removes the nested subject object from the context', function() {
              assert.isUndefined(this['subject2']);
            });

            it('should removes the subject object from the __subjects array', function() {
              assert.notEqual(this.__subjects[this.__subjects.length - 1], TEST_OBJECT2);
              assert.lengthOf(this.__subjects, 1);
            });
          });
        });

        describe('after test context', function() {
          it('should removes object from the context', function() {
            assert.isUndefined(this['subject']);
          });

          it('should removes the __subjects property from the context', function() {
            assert.isUndefined(this.__subjects);
          });
        });
      });

    }); // subject() function

    describe('property() function', function() {
      it('should be exported', function() {
        assert.typeOf(subject.property, 'function');
      });

      it('should throws if name is missing or not a string', function() {
        NON_STRINGS.forEach(function(thing) {
          assert.throws(function() { subject.property(thing); }, /name/i);
        });
      });

      it('should throws if contextKey is not a string', function() {
        NON_STRINGS.forEach(function(thing) {
          assert.throws(function() { subject.property('name', thing); }, /context/i);
        });
      });

      describe('with parent object subject', function() {
        subject.subject('subject', TEST_OBJECT);

        describe('and property subject', function() {
          subject.property('testProperty');

          it('should adds property to the context with the same name', function() {
            assert.equal(this['testProperty'], TEST_OBJECT.testProperty);
          });
        });

        describe('after test context', function() {
          it('should removes property from the context', function() {
            assert.isUndefined(this['testProperty']);
          });
        });

        describe('and property subject with a different context key', function() {
          subject.property('testProperty', 'newName');

          it('should adds property to the context with the specified key', function() {
            assert.equal(this['newName'], TEST_OBJECT.testProperty);
          });
        });
      });
    }); // property() function

  }); // Mocha-subject

})();
