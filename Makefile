
BIN := $(shell pwd)/node_modules/.bin

GLOBALS := __coverage__,buffertools,SlowBuffer,events,util,task,subject,property
TEST_ENV := test

# Project files definition
TEST_FILES := $(wildcard test/**/*.js) $(wildcard test/*.js)
LIB_FILES := $(wildcard lib/**/*.js) $(wildcard lib/*.js)
COV_FILES := $(LIB_FILES:lib/%.js=lib-cov/%.js)

INDEX_FILE = index.js

# Test parameters so we can configure these via make
TEST_TIMEOUT = 100
TEST_REPORTER = list
TDD_REPORTER = min
COVER_REPORTER = mocha-istanbul

# Command-line tools options
MOCHA_OPTS = --timeout $(TEST_TIMEOUT) --reporter $(TEST_REPORTER) --globals $(GLOBALS)
MOCHA_TDD_OPTS = $(MOCHA_OPTS) --watch --reporter $(TDD_REPORTER)
MOCHA_COVER_OPTS = $(MOCHA_OPTS) --reporter $(COVER_REPORTER)
ISTANBUL_OPTS = instrument --variable global.__coverage__ --no-compact
PLATO_OPTS = -d html-report/
HINT_OPTS = --show-non-errors
GROC_OPTS = -t lib/ -o doc/ --no-whitespace-after-token false


default: node_modules doc hint

node_modules:
	npm install

# File transformations
lib-cov/%.js: lib/%.js
	@mkdir -p $(@D)
	$(BIN)/istanbul $(ISTANBUL_OPTS) --output $@ $<


# Testing
test: node_modules
	NODE_ENV=$(TEST_ENV) $(BIN)/mocha $(MOCHA_OPTS) $(TEST_FILES)
tdd: node_modules
	NODE_ENV=$(TEST_ENV) $(BIN)/mocha $(MOCHA_TDD_OPTS) $(TEST_FILES)


# Code instrumentation
instrument: node_modules $(COV_FILES)
cover: instrument
	NODE_ENV=$(TEST_ENV) COVER=1 $(BIN)/mocha $(MOCHA_COVER_OPTS) $(TEST_FILES)

hint:
	@$(BIN)/jshint $(HINT_OPTS) $(LIB_FILES)
hint-test:
	@$(BIN)/jshint $(HINT_OPTS) $(TEST_FILES)

doc:
	$(BIN)/groc $(GROC_OPTS) $(LIB_FILES)
doc-gh:
	$(BIN)/groc $(GROC_OPTS) --github $(LIB_FILES)

complex:
	$(BIN)/plato $(PLATO_OPTS) $(LIB_FILES)


clean:
	-rm -Rf lib-cov/
	-rm -Rf html-report/
	-rm -Rf doc/


.PHONY: debug default test tdd hint hint-test doc clean instrument cover complex

