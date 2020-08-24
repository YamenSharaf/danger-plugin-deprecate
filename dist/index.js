"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var JS_FILE = /\.(js|ts)x?$/i;

var findInstance = function findInstance(content, pattern) {
  var matches = content.match(pattern);
  if (!matches) return [];
  matches = matches.filter(function (match) {
    var singleMatch = pattern.exec(match);
    if (!singleMatch || singleMatch.length === 0) return false;
    return singleMatch[1];
  });

  return matches;
};

var defaultCallback = function defaultCallback(file, matches, ruleName) {
  var ruleLevel = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "FAIL";

  switch (ruleLevel) {
    case "FAIL":
      fail(`${matches.length} ${ruleName} failed in ${file}.`);
    case "WARN":
      warn(`${matches.length} ${ruleName} found in ${file}.`);
      break;
    case "INFO":
      message(`${matches.length} ${ruleName} found in ${file}.`);
      break;
    default:
      break;
  }
};

/**
 * Danger plugin to prevent merging code that still has `console.log`s inside it.
 */

exports.default = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var callback, config, diffs, additions;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            callback = options.callback || defaultCallback;
            config = options.config || {};

            if (!(typeof callback !== "function")) {
              _context.next = 4;
              break;
            }

            throw new Error("[danger-plugin-no-console] callback option has to be an function.");

          case 4:
            diffs = danger.git.created_files.concat(danger.git.modified_files).filter(function (file) {
              return JS_FILE.test(file);
            }).map(function (file) {
              return danger.git.diffForFile(file).then(function (diff) {
                return {
                  file,
                  diff
                };
              });
            });
            _context.next = 7;
            return Promise.all(diffs);

          case 7:
            additions = _context.sent;


            additions.filter(function (_ref2) {
              var diff = _ref2.diff;
              return !!diff;
            }).forEach(function (_ref3) {
              var file = _ref3.file,
                  diff = _ref3.diff;

              config.forEach(function (configEntry) {
                var ruleName = configEntry.name;
                var ruleLevel = configEntry.level;
                var pattern = new RegExp(configEntry.rule, "g");
                var matches = findInstance(diff.added, pattern);
                if (matches.length === 0) return;

                callback(file, matches, ruleName, ruleLevel);
              });
            });

          case 9:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  function deprecate() {
    return _ref.apply(this, arguments);
  }

  return deprecate;
}();