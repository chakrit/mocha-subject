
# MOCHA-SUBJECT

Adds on to [mocha.js](http://visionmedia.github.com/mocha/).

Provides a different way to implement `before()` and `after()` hook that properly cleans
itself up after every test run simplifying several common test patterns.

### API Documentation

See the annotated source at http://gh.chakrit.net/mocha-subject/

### Example

```js
var ms = require('mocha-subject')
  , TestObject = require('../lib/test-object.js');

ms.infect(); // (optional) uses globoally.

describe('TestObject', function() {
  subject('test', function() { return new TestObject(); });

  it('should ...', function() {
    this.test; // test the object
  });

  describe('property ABC', function() {
    property('abc');

    it('should ...', function() {
      this.abc; // test property 'abc' of TestObject
    });
  });
});
```

Compares this to proper manual setups/teardowns:

```js
var ms = require('mocha-subject')
  , TestObject = require('../lib/test-object.js');

describe('TestObject', function() {
  before(function() {
    this.TestObject = new TestObject();
  });
  after(function() {
    delete this.TestObject;
  });

  describe('property ABC', function() {
    before(function() {
      this.abc = this.TestObject.abc;
    });
    after(function() {
      delete this.abc;
    });

    it('should ...', function() {
      this.test; // test the object
    });
  });
});
```

### Features

* Assigns (and automatically removes on after()) an object to the test context with a
  single line of code instead of 6.
* Assigns (and automatically removes on after()) the property of any object added
  previously to the test context with the specified name with a single line of code
  instead of 6;
* Subject cleans up after itself, there is no need for an `after` block just to make sure
  you don't leak variables to another test or setup stuff with conflicting names.

### LICENSE

BSD

### CONTRIBUTE / SUPPORT

Please file a [GitHub issue](https://github.com/chakrit/mocha-subject/issues/new) for any
question, bug reports or support requests.

##### TODO

* An encapsulated extendable `Subject` class to factor out setups/teardowns code even
  futher.
* Hook into the node.js module system to simplify subjects even further. (i.e. automatic
  requires from a string.)
* Smoother integration with mocha. Right now `infect()` and `disinfect()` requires you to
  set the `--globals` flags for mocha manually.

