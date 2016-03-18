/* globals process */

var spawn = require("child_process").spawn,
  VError = require('verror'),
  path = require("path"),
  through = require('through'),
  which = require('which');

function replacePlaceholders(obj, placeholders) {
  if (typeof obj === "string") {
    var s = obj;
    Object.keys(placeholders).forEach(function (key) {
      s = s.replace(new RegExp("\{" + key + "\}", "g"), placeholders[key]);
    });
    return s;
  }
  else {
    return obj;
  }
}

var GulpEventStream = function (mode, specialOptionKeys) {
  return function (options) {
    if (typeof (options) === 'undefined') {
      options = {};
    }
    var opt = {}; // Clone not to mess up the input object
    var allowedOptionKeys = ['galenPath', 'cwd', 'parallel', 'htmlreport', 'testngreport', 'junitreport ','jsonreport', 'properties'].concat(specialOptionKeys);
    Object.keys(options).forEach(function (key) {
      if (allowedOptionKeys.indexOf(key) < 0) {
        throw new Error("Unknown option '" + key + "'. Valid options are: " + allowedOptionKeys.join(", "));
      }
      opt[key] = options[key];
    });

    var galenPath;
    try {
      galenPath = opt.galenPath || require.resolve('.bin/galen') || which.sync('galen');
      
    } catch (e) {
      // this error is thrown by which.sync which is the last fallback option
      
      throw new VError(e, 'Could not find galen executable ' +
        'in project’s local `node_modules/.bin` folders ' +
        'or in global $PATH (' + (process.env.Path || process.env.PATH) + '). ' +
        'You can install it locally or globally by running `npm install [--save-dev|--global] galenframework`. ' +
        'Alternatively provide path to it via parameter `galenPath`.');
    }

    if (opt.galenPath) {
      delete opt.galenPath;
    }

    var properties = {};
    if (opt.properties) {
      properties = opt.properties;
      delete opt.properties;
    }

    var cwd = opt.cwd || process.cwd();
    delete opt.cwd;

    return through(function (file) {

      var stream = this;
      var fileInfo = {
        relative: file.relative,
        basename: path.basename(file.path),
        path: file.path
      };

      if (!opt.parallel) {
        // Prevent paralell execution
        stream.pause();
      }

      var args = [mode, file.path];
      Object.keys(opt).forEach(function (key) {
        if (opt[key]) {
          if (typeof opt[key] === "boolean") {
            // "galen test --recursive" support
            args.push("--" + key);
          } else {
            args.push("--" + key + "=" + replacePlaceholders(opt[key], fileInfo));
          }
        }
      });
      Object.keys(properties).forEach(function (key) {
        if (properties[key]) {
          args.push("-D" + key + "=" + replacePlaceholders(properties[key], fileInfo));
        }
      });

      spawn(galenPath, args, {
        "stdio": "inherit",
        "cwd": replacePlaceholders(cwd, fileInfo)
      }).on("close", function (code) {
        if (code === 0) {
          stream.emit('data', file);
          stream.resume();
        } else {
          stream.emit('error', new Error("Test '" + file.path + "' failed!"));
        }
      }).on("error", function (err) {
        stream.emit('error', new VError(err, "Could not start galen. Galen ('" + galenPath + "') not found?"));
      });
    });
  };
};

module.exports = {
  check: GulpEventStream('check', ['url', 'javascript', 'size', 'include', 'exclude']),
  test: GulpEventStream('test', ['parallel-tests', 'recursive', 'filter', 'groups', 'excluded-groups'])
};
