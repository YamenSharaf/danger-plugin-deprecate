const JS_FILE = /\.(js|ts)x?$/i;

const findInstance = (content, pattern) => {
  let matches = content.match(pattern);
  if (!matches) return [];
  matches = matches.filter(match => {
    const singleMatch = pattern.exec(match);
    if (!singleMatch || singleMatch.length === 0) return false;
    return singleMatch[1];
  });

  return matches;
};

const defaultCallback = (file, matches, ruleName, ruleLevel = "FAIL") => {
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
export default async function deprecate(options = {}) {
  const callback = options.callback || defaultCallback;
  const config = options.config || {};

  if (typeof callback !== "function")
    throw new Error(
      "[danger-plugin-no-console] callback option has to be an function."
    );

  const diffs = danger.git.created_files
    .concat(danger.git.modified_files)
    .filter(file => JS_FILE.test(file))
    .map(file => {
      return danger.git.diffForFile(file).then(diff => ({
        file,
        diff
      }));
    });

  const additions = await Promise.all(diffs);

  additions
    .filter(({ diff }) => !!diff)
    .forEach(({ file, diff }) => {
      config.forEach(configEntry => {
        const ruleName = configEntry.name;
        const ruleLevel = configEntry.level;
        const pattern = new RegExp(configEntry.rule, "g");
        const matches = findInstance(diff.added, pattern);
        if (matches.length === 0) return;

        callback(file, matches, ruleName, ruleLevel);
      });
    });
}
