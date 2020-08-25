import fs from 'fs'

const JS_FILE = /\.(js|ts)x?$/i

const findInstanceCount = (content, pattern) => {
  const matches = content.match(pattern)
  return (matches || []).length
}

const defaultCallback = (file, count, ruleName, ruleLevel = 'INFO') => {
  switch (ruleLevel) {
    case 'FAIL':
      fail(`${count} ${ruleName} found in ${file}`)
      break
    case 'WARN':
      warn(`${count} ${ruleName} found in ${file}`)
      break
    case 'INFO':
      message(`${count} ${ruleName} found in ${file}`)
      break
    default:
      break
  }
}

export default async function deprecate(
  options = {},
  callback = defaultCallback,
) {
  const report = {}
  const config = options.config || {}

  if (typeof callback !== 'function')
    throw new Error(
      '[danger-plugin-no-console] callback option has to be an function.',
    )

  const diffs = danger.git.created_files
    .concat(danger.git.modified_files)
    .filter(file => JS_FILE.test(file))
    .map(file => {
      return danger.git.diffForFile(file).then(diff => ({
        file,
        diff,
      }))
    })

  const additions = await Promise.all(diffs)

  config.forEach(configEntry => {
    const ruleName = configEntry.name
    const ruleLevel = configEntry.level
    const pattern = new RegExp(configEntry.rule, 'g')
    report[ruleName] = []

    additions
      .filter(({ diff }) => !!diff)
      .forEach(({ file, diff }) => {
        const count = findInstanceCount(diff.added, pattern)
        if (!count) return

        callback(file, count, ruleName, ruleLevel)
        report[ruleName].push({ file, count })
      })
  })

  return fs.writeFile(
    `deprecate_report.json`,
    JSON.stringify(report, null, 2),
    err => err && console.log(err),
  )
}
