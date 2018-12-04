                      888    d8b                    .d8888b.                             d8b d8b
                      888    Y8P                   d88P  Y88b                            Y8P Y8P
                      888                                 888
    88888b.   8888b.  888888 888 888  888  .d88b.       .d88P  8888b.  .d8888b   .d8888b 888 888
    888 "88b     "88b 888    888 888  888 d8P  Y8b  .od888P"      "88b 88K      d88P"    888 888
    888  888 .d888888 888    888 Y88  88P 88888888 d88P"      .d888888 "Y8888b. 888      888 888
    888  888 888  888 Y88b.  888  Y8bd8P  Y8b.     888"       888  888      X88 Y88b.    888 888
    888  888 "Y888888  "Y888 888   Y88P    "Y8888  888888888  "Y888888  88888P'  "Y8888P 888 888

[node-native2ascii](https://github.com/neocotic/node-native2ascii) is a [Node.js](https://nodejs.org) implementation of
Java's Native-to-ASCII Converter.

[![Build Status](https://img.shields.io/travis/neocotic/node-native2ascii/develop.svg?style=flat-square)](https://travis-ci.org/neocotic/node-native2ascii)
[![Coverage](https://img.shields.io/codecov/c/github/neocotic/node-native2ascii/develop.svg?style=flat-square)](https://codecov.io/gh/neocotic/node-native2ascii)
[![Dependency Status](https://img.shields.io/david/neocotic/node-native2ascii.svg?style=flat-square)](https://david-dm.org/neocotic/node-native2ascii)
[![Dev Dependency Status](https://img.shields.io/david/dev/neocotic/node-native2ascii.svg?style=flat-square)](https://david-dm.org/neocotic/node-native2ascii?type=dev)
[![License](https://img.shields.io/npm/l/node-native2ascii.svg?style=flat-square)](https://github.com/neocotic/node-native2ascii/blob/master/LICENSE.md)
[![Release](https://img.shields.io/npm/v/node-native2ascii.svg?style=flat-square)](https://www.npmjs.com/package/node-native2ascii)

* [Install](#install)
* [CLI](#cli)
* [API](#api)
* [Bugs](#bugs)
* [Contributors](#contributors)
* [License](#license)

## Install

Install using `npm`:

``` bash
$ npm install --save node-native2ascii
```

You'll need to have at least [Node.js](https://nodejs.org) 8 or newer.

If you want to use the command line interface you'll most likely want to install it globally so that you can run
`native2ascii` from anywhere:

``` bash
$ npm install --global node-native2ascii
```

## CLI

    Usage: native2ascii [options] [inputfile] [outputfile]

    Options:
      -e, --encoding <encoding>  specify encoding to be used by the conversion procedure
      -r, --reverse              perform reverse operation
      -V, --version              output the version number
      -h, --help                 output usage information

Converts a file that is encoded to any character encoding that is
[supported by Node.js](https://nodejs.org/dist/latest-v8.x/docs/api/buffer.html#buffer_buffers_and_character_encodings)
(which can be controlled via the `encoding` command line option and defaults to `utf8`) to a file encoded in ASCII,
using Unicode escapes ("\uxxxx" notation) for all characters that are not part of the ASCII character set.

This command is useful for properties files containing characters not in ISO-8859-1 character sets.

A reverse conversion can be performed by passing the `reverse` command line option.

If the `outputfile` command line argument is omitted, standard output is used for output. If, in addition, the
`inputfile` command line argument is omitted, standard input is used for input.

### Examples

Converts a UTF-8 encoded file into an file encoding in ASCII, Unicode escaping characters not in the ASCII character
set:

``` bash
# Using file command line arguments:
$ native2ascii utf8.properties ascii.properties
# Using STDIN and STDOUT:
$ cat utf8.properties | native2ascii > ascii.properties
```

Converts a ASCII encoded file into a file encoded in UTF-8, unescaping any Unicode escapes:

``` bash
# Using file command line arguments:
$ native2ascii --reverse ascii.properties utf8.properties
# Using STDIN and STDOUT:
$ cat ascii.properties | native2ascii --reverse > utf8.properties
```

## API

### native2ascii(input[, options])

Converts the specified `input` so that it can be encoded in ASCII by using Unicode escapes ("\uxxxx" notation) for all
characters that are not part of the ASCII character set.

This function is useful for properties files containing characters not in ISO-8859-1 character sets.

A reverse conversion can be performed by enabling the `reverse` option.

#### Options

| Option    | Description                      | Default |
| --------- | -------------------------------- | ------- |
| `reverse` | Whether to reverse the operation | `false` |

#### Examples

Unicode escape characters not in the ASCII character set so that they can be safely written encoded into ASCII:

``` javascript
const native2ascii = require('node-native2ascii');

native2ascii('I ♥ native2ascii!');
//=> "I \\u2665 native2ascii!"
```

These can be later unescaped by reversing the operation:

``` javascript
const native2ascii = require('node-native2ascii');

native2ascii('I \\u2665 native2ascii!', { reverse: true });
//=> "I ♥ native2ascii!"
```

## Bugs

If you have any problems with node-native2ascii or would like to see changes currently in development you can do so
[here](https://github.com/neocotic/node-native2ascii/issues).

## Contributors

If you want to contribute, you're a legend! Information on how you can do so can be found in
[CONTRIBUTING.md](https://github.com/neocotic/node-native2ascii/blob/master/CONTRIBUTING.md). We want your suggestions
and pull requests!

A list of node-native2ascii contributors can be found in
[AUTHORS.md](https://github.com/neocotic/node-native2ascii/blob/master/AUTHORS.md).

## License

Copyright © 2018 Alasdair Mercer

See [LICENSE.md](https://github.com/neocotic/node-native2ascii/raw/master/LICENSE.md) for more information on our MIT
license.
