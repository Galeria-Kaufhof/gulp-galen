var spawn = require("child_process").spawn,
  path = require("path"),
  through = require('through');

var GulpEventStream = function(mode, specialOptionKeys) {
  return function(options) {
    if (options == null) {
      options = {};
    }
    var opt = {}; // Clone not to mess up the input objecz
    var allowedOptionKeys = ['galenPath', 'parallel', 'htmlreport', 'testngreport', 'jsonreport', 'properties'].concat(specialOptionKeys);
    Object.keys(options).forEach(function(key) {
      if (allowedOptionKeys.indexOf(key) < 0) {
        throw new Error("Unknown option '" + key + "'. Valid options are: " + allowedOptionKeys.join(", "));
      }
      opt[key] = options[key];
    });

    var galenPath = "/usr/local/bin/galen";
    if (opt.galenPath) {
      galenPath = opt.galenPath;
      delete opt.galenPath;
    }

    var properties = {};
    if (opt.properties) {
      properties = opt.properties;
      delete opt.properties;
    }

    return through(function(file) {
      if (!opt.parallel) {
        // Prevent paralell execution
        this.pause();
      }

      var args = [mode, file.path];
      Object.keys(opt).forEach(function(key) {
        if (opt[key]) {
          args.push("--" + key + "=" + opt[key]);
        }
      });
      Object.keys(properties).forEach(function(key) {
        if (properties[key]) {
          args.push("-D" + key + "=" + properties[key]);
        }
      });

      spawn(galenPath, args, {
        "stdio": "inherit"
      }).on("close", function(code) {
        if (code === 0) {
          return this.emit('data', file);
        } else {
          throw new Error("Test '" + file.path + "' failed!");
        }
      }).on("error", function(err) {
        throw new Error("Could not start galen. Galen ('" + galenPath + "') not found?");
      });
    });
  };
};

module.exports = {
  check: GulpEventStream('check', ['url', 'javascript', 'size', 'include', 'exclude']),
  test: GulpEventStream('test', ['parallel-tests', 'recursive', 'filter', 'groups', 'excluded-groups'])
};
