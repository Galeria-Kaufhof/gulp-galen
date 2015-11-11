/* globals describe, it, xit */

var assert = require("assert");
var gulp = require("gulp");
var es = require("event-stream");
var util = require("util");

var gulpGalen = require('../index.js');

describe("gulp-galen's code functionality", function () {

  this.timeout(30000);

  var options = {
     url: "https://www.google.com",
     size: "800x600",
     galenPath: "./node_modules/.bin/galen"
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