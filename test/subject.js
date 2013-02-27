
// test/subject.js - Test subject.js
(function() {

  var _ = require('underscore')
    , assert = require('chai').assert
    , subject = require('../lib/subject');

  var NON_STRINGS = [123, { }, null, undefined, [], function() { }]
    , NON_FUNCS = [123, { }, null, undefined, [], 'string']
    , TEST_OBJECT = { testProperty: 'value' }
    , TEST_OBJECT2 = { testProperty: 'value2' };


  describe('Mocha-subject', function() {

    describe('subject() function', function() {
      it('should be exported', function() {
        assert.typeOf(subject.subject, 'function');
      });

      it('should throws if `name` argument is missing or not a string', function() {
        NON_STRINGS.forEach(function(thing) {
          assert.throws(function() { subject.subject(thing); }, /name/i);
        });
      });

      it('should throws if `factory` argument is missing or not a function', function() {
        NON_FUNCS.forEach(function(thing) {
          assert.throws(function() { subject.subject('name', thing); }, /factory/i);
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
          if (thing === undefined) return;
          assert.throws(function() { subject.property('name', thing); }, /context/i);
        });
      });
    });

    describe('simple object subject factory', function() {
      describe('in test context', function() {
        subject.subject('subject', function() {
          this.accessible = true;
          return TEST_OBJECT;
        });

        it('should adds object to the context', function() {
          assert.equal(this['subject'], TEST_OBJECT);
        });

        it('should be invoked with the mocha context subject as `this`', function() {
          assert.ok(this.accessible);
        });

        it('should adds a non-enumerable __subjects array to the context', function() {
          assert.instanceOf(this.__subjects, Array);
        });

        it('should adds info object to the end of the __subjects array', function() {
          var info = this.__subjects[this.__subjects.length - 1];
          assert.equal(info.name, 'subject');
          assert.equal(info.factory(), TEST_OBJECT);
          assert.equal(info.instance, TEST_OBJECT);
        });

        describe('with property subject', function() {
          subject.property('testProperty');

          it('should adds property to the context with the same name', function() {
            assert.equal(this['testProperty'], TEST_OBJECT.testProperty);
          });

          describe('and another property subject with a another name', function() {
            subject.property('testProperty', 'newName');

            it('should adds property to the context with the specified name', function() {
              assert.equal(this['newName'], TEST_OBJECT.testProperty);
            });

            it('previous property subject should still be accessible', function() {
              assert.equal(this['testProperty'], TEST_OBJECT.testProperty);
            });
          });
        });

        describe('after property subject context', function() {
          it('should removes property from the context', function() {
            assert.isUndefined(this['testProperty']);
          });

          it('should removes property from the nested context', function() {
            assert.isUndefined(this['newName']);
          });
        });

        describe('nested within another object context', function() {
          subject.subject('subject2', function() { return TEST_OBJECT2; });

          it('should adds nested object to the context', function() {
            assert.equal(this['subject2'], TEST_OBJECT2);
          });

          it('parent subject object should still be accessible', function() {
            assert.equal(this['subject'], TEST_OBJECT);
          });

          it('should adds info for nested object to the end of the __subjects array', function() {
            var info = this.__subjects[this.__subjects.length - 1];
            assert.equal(info.name, 'subject2');
            assert.equal(info.factory(), TEST_OBJECT2);
            assert.equal(info.instance, TEST_OBJECT2);
          });

          describe('with a property subject', function() {
            subject.property('testProperty');

            it('should adds property of the nested subject object to the context', function() {
              assert.equal(this['testProperty'], TEST_OBJECT2.testProperty);
            });
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

  }); // Mocha-subject

})();
