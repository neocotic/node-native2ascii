## Version 0.3.0, 2025.08.04

* **Breaking Change:** Return empty string if `input` parameter is either `null` or `undefined`
* **Breaking Change:** Print help output and exit when STDIN is empty and no command line arguments passed to CLI
* Explicitly add full support for converting characters within the Basic Multilingual Plane (BMP)
* Rewrite the entire codebase in TypeScript and support both ESM and CJS usage
* Improve documentation
* Improve the developer experience for contributors with better tooling
* Bump all dependencies to latest versions

## Version 0.2.0, 2018.12.04

* added package-lock.json file to enable "npm audit" [b2ff6af](https://github.com/neocotic/node-native2ascii/commit/b2ff6af)
* moved from !ninja to neocotic [7111853](https://github.com/neocotic/node-native2ascii/commit/7111853)
* modified CI to now target Node.js 8, 10, and 11 [6471d3a](https://github.com/neocotic/node-native2ascii/commit/6471d3a)
* bumped devDependencies [5673ff3](https://github.com/neocotic/node-native2ascii/commit/5673ff3)
* bumped dependencies [40dc1e9](https://github.com/neocotic/node-native2ascii/commit/40dc1e9)
* corrected input/output syntax for API examples [d475abd](https://github.com/neocotic/node-native2ascii/commit/d475abd)

## Version 0.1.2, 2018.01.25

* Move Unicode escape and unescape logic out to new `escape-unicode` and `unescape-unicode` modules respectively
* Configure travis to also build against Node.js v9
* Replace `chai` with `assert` in unit tests
* Bump dependencies

## Version 0.1.1, 2017.12.09

* Fix require statements in README examples [#2](https://github.com/neocotic/node-native2ascii/issues/2)

## Version 0.1.0, 2017.12.08

* Initial release
