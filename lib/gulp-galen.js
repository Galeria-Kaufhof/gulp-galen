/* globals process */

var spawn = require("child_process").spawn,
	fs = require("fs"),
	path = require("path"),
	PluginError = require('gulp-util').PluginError,
	through = require('through2');

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

var runGalen = function (stream, callback, galenPath, mode, file, cwd, opt, properties) {

	var fileInfo = {
		relative: file.relative,
		basename: path.basename(file.path),
		path: file.path
	};

	if (!opt.parallel) {
		// Prevent parallel execution
		stream.pause();
	}

	var args = [mode, file.path];
	Object.keys(opt).forEach(function (key) {
		if (opt[key]) {
			args.push("--" + key + "=" + replacePlaceholders(opt[key], fileInfo));
		}
	});
	Object.keys(properties).forEach(function (key) {
		if (properties[key]) {
			args.push("-D" + key + "=" + replacePlaceholders(properties[key], fileInfo));
		}
	});

	var galenProcess = spawn(galenPath, args, {
		stdio: "inherit", // TODO add silent option,
		//env: process.env,
		cwd: replacePlaceholders(cwd, fileInfo)
	}).on('exit', function (code) {
		if (galenProcess) {
			galenProcess.kill();
		}
		if (stream) {
			if (code === 0) {
				stream.emit('data', file);
				stream.resume();
			} else {
				stream.emit('error', new PluginError('Galen', 'Test ' + file.path + ' failed!'));
			}
		}
		callback(null, file);
	}).on("error", function (err) {
		stream.emit('error', new PluginError('Galen', 'Could not start galen. Galen (' + galenPath + ') not found?'));
		callback(err, file);
	});

};

var GulpEventStream = function (mode, specialOptionKeys) {
	return function (options) {
		if (typeof (options) === 'undefined') {
			options = {};
		}
		var opt = {}; // Clone not to mess up the input object
		var allowedOptionKeys = ['galenPath', 'cwd', 'parallel', 'htmlreport', 'testngreport', 'junitreport ', 'jsonreport', 'properties'].concat(specialOptionKeys);
		Object.keys(options).forEach(function (key) {
			if (allowedOptionKeys.indexOf(key) < 0) {
				throw new Error("Unknown option '" + key + "'. Valid options are: " + allowedOptionKeys.join(", "));
			}
			opt[key] = options[key];
		});

		var galenPath = __dirname + '/../node_modules/galenframework/bin/galen' + ('win32' ? '.cmd' : '');
		fs.stat(galenPath, function (err) {
			// resolve for NPM3+
			if (err) {
				galenPath = __dirname + '/../../galenframework/bin/galen' + ('win32' ? '.cmd' : '');
			}
		});
		if (opt.galenPath) {
			galenPath = opt.galenPath;
			delete opt.galenPath;
		}

		var properties = {};
		if (opt.properties) {
			properties = opt.properties;
			delete opt.properties;
		}

		var cwd = opt.cwd || process.cwd();
		delete opt.cwd;

		return through.obj(function (file, enc, cb) {
			runGalen(this, cb, galenPath, mode, file, cwd, opt, properties);
		});
	};
};

module.exports = {
	check: GulpEventStream('check', ['url', 'javascript', 'size', 'include', 'exclude']),
	test: GulpEventStream('test', ['parallel-tests', 'recursive', 'filter', 'groups', 'excluded-groups'])
};
