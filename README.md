# gulp-galen

[![npm version](https://badge.fury.io/js/gulp-galen.svg)](https://www.npmjs.com/package/gulp-galen)
[![Build Status](https://travis-ci.org/Galeria-Kaufhof/gulp-galen.svg?branch=master)](https://travis-ci.org/Galeria-Kaufhof/gulp-galen)
[![Gitter Chat](https://camo.githubusercontent.com/7d924c483d0d9dff10763921aea2038e660e1252/68747470733a2f2f6261646765732e6769747465722e696d2f67697474657248512f6769747465722e737667)](https://gitter.im/hypery2k/galenframework-cli)

A gulp plugin for using the galen-framework within a gulp based build toolchain.


## Installation

```Shell
npm install --save-dev gulp-galen
```

`gulp-galen` will search for galen in locally installed packages (`npm install --save-dev galenframework`) and in $PATH. 
If you have galen in other location use the `galenPath` option to specify the correct path:

```JavaScript
gulpGalen.check({galenPath: '/some/other/path/to/galen'})
```

## Usage

```JavaScript
var gulpGalen = require('gulp-galen');
```

This provides two gulp stream constructors:

* `gulpGalen.check(options, processOptions)`: runs a specified .gspec against a given url.
* `gulpGalen.test(options, processOptions)`: runs a test against a given testsuite (JavaScript based or Galen test suite style)

## Options

All String options support some simple placeholders to be filled with information about
the current file:

* `{basename}`: The current file’s `path.basename()`
* `{relative}`: The current file’s relative file name
* `{path}`: The current file’s full path

This might especially be useful when generating reports. Example:

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
* `properties`: an object specifying properties (like `galen.browserFactory.selenium.grid.url`) to pass into galen
* `htmlreport`: path to folder in which Galen should generate HTML reports
* `testngreport`: path to xml file in which Galen should write TestNG report
* `junitreport `: path to xml file in which Galen should write JUnit report
* `jsonreport`: path to folder in which Galen should generate JSON reports
* `parallel`: Allow multiple parallel galen processes (not to confuse with `parallel-tests` doing the parallelization in one galen process)

## Examples

### Run some gspec against google.com:

```JavaScript
var gulpGalen = require('gulp-galen');

gulp.task("test:galen", function() {
  gulp.src('test/galen/**/*.gspec').pipe(gulpGalen.check({
    url: 'https://www.google.com',
    cwd: 'test/galen/'
  }));
});
```

### Run some JavaScript based test suites:

```JavaScript
var gulpGalen = require('gulp-galen');

gulp.task("test:galen", function() {
  gulp.src('test/galen/**/*.js').pipe(gulpGalen.test());
});
```

Run some JavaScript based test suites against a Selenium Grid:

```JavaScript
var gulpGalen = require('gulp-galen');

var galenProperties = {
  'galen.browserFactory.selenium.runInGrid': true,
  'galen.browserFactory.selenium.grid.url': 'http://example.com:4444/wd/hub'
};

gulp.task("test:galen", function() {
  gulp
    .src('test/galen/**/*.js')
    .pipe(gulpGalen.test({
      properties: galenProperties,
      cwd: 'test/galen/'
    }));
});
```
