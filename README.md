# danger-plugin-deprecate

[![Build Status](https://travis-ci.org/yamensharaf/danger-plugin-deprecate.svg?branch=master)](https://travis-ci.org/yamensharaf/danger-plugin-deprecate)
[![npm version](https://badge.fury.io/js/danger-plugin-deprecate.svg)](https://badge.fury.io/js/danger-plugin-deprecate)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

> allows to warn or prevent merge on unwanted changes

## Usage

Install:

```sh
npm install -D danger-plugin-deprecate
```

At a glance:

```js
// dangerfile.js
import deprecate from "danger-plugin-deprecate";

const config = [
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

deprecate({ config });
```

## Changelog

See the GitHub [release history](https://github.com/yamensharaf/danger-plugin-deprecate/releases).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
