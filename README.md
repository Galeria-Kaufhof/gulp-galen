# Gulp plugin for the Galenframework

[Galen](http://galenframework.com) allows automated testing of look and feel for your responsive websites.

> Gulp plugin for [Galen](http://galenframework.com/) testing framework

[![Build Status](https://travis-ci.org/hypery2k/gulp-galenframework.svg)](https://travis-ci.org/hypery2k/gulp-galenframework) [![License](https://img.shields.io/github/license/mashape/apistatus.svg)](LICENSE) [![npm version](https://badge.fury.io/js/gulp-galenframework.svg)](http://badge.fury.io/js/grunt-galenframework)

[![NPM](https://nodei.co/npm/gulp-galenframework.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/gulp-galenframework/)

This module downloads the GalenFramework for you

*Warning* - Galen framework requires Java runtime environment to work. Java is ***not*** included in this module.

## Installation

```Shell
npm install gulp-galenframework
```

If this doesn't want to use the provided galen version use the `galenPath` option to specify the
correct path:

```JavaScript
gulpGalen.check({galenPath: '/some/other/path/to/galen'})
```

### Bundling Galen

When you're **not** using the `--production` mode you can use the bundeled galen by using the
`galenPath` option:

```JavaScript
gulpGalen.check({galenPath: './node_modules/gulp-galenframework/node_modules/.bin/galen'})
```

Another alternative it to add `galenframework-cli` into you project's dependencies:

```Shell
npm install galenframework-cli --save
```

Then you could use the `galenPath` option as follows:

```JavaScript
gulpGalen.check({galenPath: './node_modules/.bin/galen'})
```

## Usage

```JavaScript
var gulpGalen = require('gulp-galenframework');
```

This provides two gulp stream constructors:

* `gulpGalen.check(options, processOptions)`: runs a speficied .gspec aganst a given url.
* `gulpGalen.test(options, processOptions)`: runs a test against a given testsuite (JavaScript based or Galen test suite style)

## Options

All String options support some simple placeholders to be filled with information about
the current file:

* `{basename}`: The current file's `path.basename()`
* `{relative}`: The current file's relative file name
* `{path}`: The current file's full path

This might especially be useful when generating repots. Example:

```JavaScript
gulpGalen.check((htmlreport: "reports/{relative}"))
```

### `check` options

* `url`: a URL of page for Galen to test on
* `javascript`: a path for javascript file which Galen will inject in web page
* `size`: dimensions of browser window. Consists of two numbers separated by “x” symbol
* `include`: a comma separated list of tags for spec sections which will be included in testing
* `exclude`: a comma separated list of tags for spec sections to be excluded from the filtered group

### `test` options

 * `parallel-tests`: amount of threads for running tests in parallel
 * `recursive`: flag which is used in case you want to search for all .test files recursively in folder
 * `filter`: a filter for a test name
 * `groups`: run only specified test groups
 * `excluded-groups`: exclude test groups

### global options

This options apply to both `check` and `test`.

* `galenPath`: if other then /usr/local/bin/galen
* `cwd`: change the working directory for the created processes
* `properties`: an object specifing properties (like `galen.browserFactory.selenium.grid.url`) to pass into galen
* `htmlreport`: path to folder in which Galen should generate HTML reports
* `testngreport`: path to xml file in which Galen should write TestNG report
* `junitreport `: path to xml file in which Galen should write JUnit report
* `jsonreport`: path to folder in which Galen should generate JSON reports
* `parallel`: Allow multiple parallel galen processes (not to confuse with `parallel-tests` doing the parallelization in one galen process)

## Examples

### Run some gspec against google.com:

```JavaScript
var gulpGalen = require('gulp-galenframework');

gulp.task("test:galen", function(done) {
  gulp.src('test/galen/**/*.gspec').pipe(gulpGalen.check({
    url: 'https://www.google.com',
    cwd: 'test/galen/'
  }, done));
});
```

### Run some JavaScript based test suites:

```JavaScript
var gulpGalen = require('gulp-galenframework');

gulp.task("test:galen", function(done) {
  gulp.src('test/galen/**/*.js').pipe(gulpGalen.test({}, done));
});
```

Run some JavaScript based test suites against a Selenium Grid:

```JavaScript
var gulpGalen = require('gulp-galenframework');

var galenProperties = {
  'galen.browserFactory.selenium.runInGrid': true,
  'galen.browserFactory.selenium.grid.url': 'http://example.com:4444/wd/hub'
};

gulp.task("test:galen", function(done) {
  gulp
    .src('test/galen/**/*.js')
    .pipe(gulpGalen.test({
		  'htmlreport': __dirname + '/reports/layout-tests',
      'properties': galenProperties,
      'cwd': 'test/galen/'
    }, done));
});
```
