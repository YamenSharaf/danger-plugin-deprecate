import deprecate from './'

jest.mock('fs', () => ({ writeFile: jest.fn() }))

const mockConfig = [
  {
    name: 'createComponent',
    rule: '(createComponent)',
    ruleDescription:
      'Regex to find createComponent calls but try not to get testing createComponent()',
    level: 'FAIL',
  },
  {
    name: 'console_log_warn',
    rule: '(console.)(log|warn)',
    ruleDescription: 'Regex to find console.log or console.warn calls',
    level: 'INFO',
  },
  {
    name: 'TODO',
    rule: '(TODO)',
    ruleDescription: 'Regex to find TODO comments',
    level: 'WARN',
  },
]

const mockFiles = {
  'src/clean.js': `
    function add(a, b) {
      return a + b;
    }
    `,
}

// Mock the Danger API
const mockGlobals = () => {
  const fileNames = Object.keys(mockFiles)
  global.danger = {
    git: {
      modified_files: [...fileNames.filter((_, i) => i < fileNames.length / 2)],
      created_files: [...fileNames.filter((_, i) => i >= fileNames.length / 2)],
      diffForFile: file =>
        Promise.resolve({
          added: mockFiles[file],
        }),
    },
    github: {
      utils: {
        fileContents: path =>
          new Promise(res => {
            res(mockFiles[path])
          }),
      },
    },
  }

  global.fail = jest.fn()
  global.warn = jest.fn()
  global.message = jest.fn()
}

describe('deprecate()', () => {
  beforeAll(() => {
    mockGlobals()
  })
  beforeEach(jest.clearAllMocks)

  it('should not fail if no rule is present in files', async () => {
    await deprecate({
      config: mockConfig,
    })
    expect(global.message).toHaveBeenCalledTimes(0)
    expect(global.warn).toHaveBeenCalledTimes(0)
    expect(global.fail).toHaveBeenCalledTimes(0)
  })

  it('should fail when a fail rule is met', async () => {
    mockFiles['src/createComponent.js'] = `
      function add(a, b) {
        const component = createComponent(() => {})
        return a + b;
      }`
    mockGlobals()

    await deprecate({
      config: mockConfig,
    })
    expect(global.fail).toHaveBeenCalledTimes(1)

    delete mockFiles['src/createComponent.js']
  })

  it('should detect multiple rules in a single file', async () => {
    mockFiles['src/multiple-rules.js'] = `
    function add(a, b) {
      // TODO: something
      console.warn(b, a);
      return a + b;
    }`
    mockGlobals()

    await deprecate({
      config: mockConfig,
    })

    expect(global.message).toHaveBeenCalledTimes(1)
    expect(global.warn).toHaveBeenCalledTimes(1)
    expect(global.warn).toHaveBeenCalledWith(
      '1 TODO found in src/multiple-rules.js',
    )
    expect(global.message).toHaveBeenCalledWith(
      '1 console_log_warn found in src/multiple-rules.js',
    )

    delete mockFiles['src/multiple-rules.js']
  })

  it('should detect multiple appearances of the same rules in a single file', async () => {
    mockFiles['src/single-rule-multiple-appearances.js'] = `
    function add(a, b) {
      // TODO: something
      // TODO: something else
      return a + b;
    }`

    mockGlobals()

    await deprecate({
      config: mockConfig,
    })

    expect(global.message).toHaveBeenCalledTimes(0)
    expect(global.warn).toHaveBeenCalledTimes(1)
    expect(global.warn).toHaveBeenCalledWith(
      '2 TODO found in src/single-rule-multiple-appearances.js',
    )

    delete mockFiles['src/single-rule-multiple-appearances.js']
  })

  it('should detect a mix of multiple rules and multiple appearances in a single file', async () => {
    mockFiles['src/multi-mix.js'] = `
          function add(a, b) {
            // TODO: something
            console.warn(b, a);
            // TODO: something else
            return a + b;
          }`

    mockGlobals()

    await deprecate({
      config: mockConfig,
    })

    expect(global.message).toHaveBeenCalledTimes(1)
    expect(global.warn).toHaveBeenCalledTimes(1)
    expect(global.warn).toHaveBeenCalledWith('2 TODO found in src/multi-mix.js')
    expect(global.message).toHaveBeenCalledWith(
      '1 console_log_warn found in src/multi-mix.js',
    )

    delete mockFiles['src/multi-mix.js']
  })

  it('should detect rules in multiple files', async () => {
    mockFiles['src/multi-mix.js'] = `
          function add(a, b) {
            // TODO: something
            console.warn(b, a);
            // TODO: something else
            return a + b;
          }`

    mockFiles['src/createComponent.js'] = `
          function add(a, b) {
            const component = createComponent(() => {})
            return a + b;
          }`

    mockGlobals()

    await deprecate({
      config: mockConfig,
    })

    expect(global.message).toHaveBeenCalledTimes(1)
    expect(global.warn).toHaveBeenCalledTimes(1)
    expect(global.fail).toHaveBeenCalledTimes(1)
  })
})
