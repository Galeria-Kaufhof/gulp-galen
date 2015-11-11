# gulp-galen

A gulp plugin for using the galen-framework within a gulp based build toolchain.

## Installation

    npm install gulp-galen


Galen needs to be installed on the system. You could do this with:

    npm install -g galenframework-cli

## Usage

    var gulpGalen = require('gulp-galen');

This provides two gulp stream constructors:

* `gulpGalen.check(options)`: runs a speficied .gspec aganst a given url.
* `gulpGalen.test(options)`: runs a test against a given testsuite (JavaScript based or Galen test suite style)

## Options

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
* `htmlreport`: path to folder in which Galen should generate HTML reports
* `testngreport`: path to xml file in which Galen should write TestNG report
* `jsonreport`: path to folder in which Galen should generate JSON reports
* `parallel`: Allow multiple parallel galen processes (not to confuse with `parallel-tests` doing the parallelization in one galen process)

## Examples

Run some gspec against google.com:

    gulp.task("test:galen", function() {
        gulp.src('test/galen/**/*.gspec').pipe(gulpGalen.check(url: 'https://www.google.com'));
    });

Run some JavaScript based test suites:

    gulp.task("test:galen", function() {
      gulp.src('test/galen/**/*.js').pipe(gukpGalen.test());
    });