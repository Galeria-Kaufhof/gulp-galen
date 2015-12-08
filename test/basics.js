/* globals describe, it, xit, before, after */

var assert = require("assert");
var gulp = require("gulp");
var es = require("event-stream");
var util = require("util");
var fs = require("fs");
var rimraf = require("rimraf");

var gulpGalen = require('../index.js');

describe("gulp-galen", function () {

  describe("basic functionality", function () {

    this.timeout(30000);

    var options = {
      url: "https://www.google.com",
      size: "800x600",
      galenPath: "./node_modules/galenframework/bin/galen"
    };

    it("should iterate over some gspecs", function (done) {
      gulp.src("**/specs/google?.gspec")
        .pipe(gulpGalen.check(options))
        .pipe(es.writeArray(function (err, arr) {
          assert(!err, "There where errors present");
          assert(arr, "Result missing");
          assert(arr.length === 2, "False number of files: " + util.inspect(arr));
          for (var i = 0; i < 2; i++) {
            assert(arr[i].path.match(/specs\/google.\.gspec$/), "File's path didn't end with specs/google?.gspec: '" + arr[i].path + "'");
          }
          done();
        }));
    });

    it("should handle failed specs", function (done) {
      gulp.src("**/specs/google_failing.gspec")
        .pipe(gulpGalen
          .check(options)
          .on("error", function () {
            done();
          }));
    });

  });

  describe("extended functionality", function () {

    this.timeout(30000);

    before(function (done) {
      rimraf("./tmp/test-reports", done);
    });

    it("should support some variables based upon the current file", function (done) {
      gulp.src("**/specs/google1.gspec")
        .pipe(gulpGalen.check({
          url: "https://www.google.com",
          size: "800x600",
          galenPath: "./node_modules/galenframework/bin/galen",
          testngreport: "./tmp/test-reports/testng-{basename}.xml"
        }))
        .pipe(es.writeArray(function (err, arr) {
          var fn = "./tmp/test-reports/testng-google1.gspec.xml";
          fs.stat(fn, function (err, stats) {
            assert(!err, "File not found: " + fn);
            assert(stats.isFile(), "Is no file: " + fn);
            done();
          });
        }));
    });

  });

});