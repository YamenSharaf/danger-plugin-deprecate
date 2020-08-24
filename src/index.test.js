import deprecate from "./";

const mockConfig = [
  {
    name: "createComponent",
    rule: "(createComponent)",
    ruleDescription:
      "Regex to find createComponent calls but try not to get testing createComponent()",
    level: "FAIL"
  },
  {
    name: "console_log_warn",
    rule: "(console.)(log|warn)",
    ruleDescription: "Regex to find console.log or console.warn calls",
    level: "INFO"
  },
  {
    name: "TODO",
    rule: "(TODO)",
    ruleDescription: "Regex to find TODO comments",
    level: "WARN"
  }
];

const mockFilesList = {
  "src/log.js": `
    function add(a, b) {
      return a + b;
    }
    `,
  "src/clean.js": `
    function add(a, b) {
      return a + b;
    }
    `,
  "src/error.js": `
    function add(a, b) {
      const component = createComponent(() => {})
      return a + b;
    }`,
  "src/multiple.js": `
    function add(a, b) {
      // TODO: something
      console.warn(b, a);
      return a + b;
    }`
};

const multipleErrorsExample = `
function add(a, b) {

  console.warn(b, a);
  return a + b;
}`;

const fileNames = Object.keys(mockFilesList);

// Mock the Danger API
global.danger = {
  git: {
    modified_files: [fileNames[0], fileNames[1]],
    created_files: [fileNames[2], fileNames[3]],
    diffForFile: file =>
      Promise.resolve({
        added: mockFilesList[file]
      })
  },
  github: {
    utils: {
      fileContents: path =>
        new Promise(res => {
          res(mockFilesList[path]);
        })
    }
  }
};

beforeEach(() => {
  jest.clearAllMocks();
  global.fail = jest.fn();
  global.warn = jest.fn();
  global.message = jest.fn();
});

afterEach(() => {
  global.fail = undefined;
  global.warn = undefined;
  global.message = undefined;
});

describe("deprecate()", () => {
  it("should detect multiple errors in file", async () => {
    mockFilesList["src/multiple.js"] = multipleErrorsExample;
    await deprecate({
      config: mockConfig
    });
    expect(global.message).toHaveBeenCalledTimes(1);
    expect(global.warn).toHaveBeenCalledTimes(1);
  });

  it("should fail when a fail rule is met", async () => {
    await deprecate({
      config: mockConfig
    });
    expect(global.fail).toHaveBeenCalledTimes(1);
  });

  it("should not fail ");
});
