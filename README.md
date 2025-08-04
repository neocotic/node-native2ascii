                 _   _           ___                _ _ 
                | | (_)         |__ \              (_|_)
     _ __   __ _| |_ ___   _____   ) |__ _ ___  ___ _ _
    | '_ \ / _` | __| \ \ / / _ \ / // _` / __|/ __| | |
    | | | | (_| | |_| |\ V /  __// /| (_| \__ \ (__| | |
    |_| |_|\__,_|\__|_| \_/ \___|____\__,_|___/\___|_|_|

[![Build Status](https://img.shields.io/github/actions/workflow/status/neocotic/node-native2ascii/ci.yml?event=push&style=for-the-badge)](https://github.com/neocotic/node-native2ascii/actions/workflows/ci.yml)
[![Downloads](https://img.shields.io/npm/dw/node-native2ascii?style=for-the-badge)](https://github.com/neocotic/node-native2ascii)
[![Release](https://img.shields.io/npm/v/node-native2ascii?style=for-the-badge)](https://github.com/neocotic/node-native2ascii)
[![License](https://img.shields.io/github/license/neocotic/node-native2ascii?style=for-the-badge)](https://github.com/neocotic/node-native2ascii/blob/main/LICENSE.md)

[node-native2ascii](https://github.com/neocotic/node-native2ascii) is a [Node.js](https://nodejs.org) implementation of
Java's Native-to-ASCII Converter.

## Install

Install using [npm](https://npmjs.com):

``` sh
npm install --save node-native2ascii
```

Or, to be able to access the `native2ascii` command from anywhere:

``` sh
npm install --global node-native2ascii
```

## Usage

### API

#### `native2ascii(input[, options])`

Converts characters within `input` so that it can be encoded in ASCII by using Unicode escapes ("\uxxxx" notation) for
all characters that are not part of the ASCII character set.

This can be useful when dealing with `.properties` files and characters that are not in the ISO-8859-1 character set.

The `reverse` option can be specified to reverse the conversion and instead convert Unicode escapes to their
corresponding Unicode characters.

Characters within the Basic Multilingual Plane (BMP) as well as surrogate pairs for characters outside BMP are
supported.

##### Options

| Option    | Type      | Default | Description                         |
|-----------|-----------|---------|-------------------------------------|
| `reverse` | `boolean` | `false` | Whether the reverse the conversion. |

##### Examples

``` javascript
import { native2ascii } from "node-native2ascii";

native2ascii("I ♥ Unicode!");
//=> "I \\u2665 Unicode!"
native2ascii("𠮷𠮾");
//=> "\\ud842\\udfb7\\ud842\\udfbe"

native2ascii("I \\u2665 Unicode!", { reverse: true });
//=> "I ♥ Unicode!"
native2ascii("\\ud842\\udfb7\\ud842\\udfbe", { reverse: true });
//=> "𠮷𠮾"
```

### CLI

    Usage: native2ascii [options] [input-file] [output-file]

    Options:
      -e, --encoding <encoding>  specify encoding to use (default: "utf8")
      -r, --reverse              perform reverse conversion (default: false)
      -V, --version              output the version number
      -h, --help                 display help for command

Converts a file that is encoded to any character encoding that is
[supported by Node.js](https://nodejs.org/api/buffer.html#buffers-and-character-encodings) (which can be controlled via
the `encoding` command line option) to a file encoded in ASCII, using Unicode escapes ("\uxxxx" notation) for all
characters that are not part of the ASCII character set.

This can be useful when dealing with `.properties` files and characters that are not in the ISO-8859-1 character set.

The `reverse` command line option can be specified to reverse the conversion and instead convert Unicode escapes to
their corresponding Unicode characters.

If the `output-file` command line argument is not specified, standard output is used for output. Additionally, if the
`input-file` command line argument is not specified, standard input is used for input.

#### Examples

Convert a file encoded using UTF-8 into a file encoded using ASCII, Unicode escaping characters not in the ASCII
character set:

``` sh
# Using file command line arguments:
native2ascii utf8.properties ascii.properties
# Using STDIN and STDOUT:
cat utf8.properties | native2ascii > ascii.properties
```

Convert a file encoded using ASCII into a file encoded using UTF-8, unescaping any Unicode escapes:

``` sh
# Using file command line arguments:
native2ascii --reverse ascii.properties utf8.properties
# Using STDIN and STDOUT:
cat ascii.properties | native2ascii --reverse > utf8.properties
```

## Related

* [escape-unicode](https://github.com/neocotic/escape-unicode)
* [properties-store](https://github.com/neocotic/properties-store)
* [unescape-unicode](https://github.com/neocotic/unescape-unicode)

## Bugs

If you have any problems with this package or would like to see changes currently in development, you can do so
[here](https://github.com/neocotic/node-native2ascii/issues).

## Contributors

If you want to contribute, you're a legend! Information on how you can do so can be found in
[CONTRIBUTING.md](https://github.com/neocotic/node-native2ascii/blob/main/CONTRIBUTING.md). We want your suggestions and
pull requests!

A list of all contributors can be found in
[AUTHORS.md](https://github.com/neocotic/node-native2ascii/blob/main/AUTHORS.md).

## License

Copyright © 2025 neocotic

See [LICENSE.md](https://github.com/neocotic/node-native2ascii/raw/main/LICENSE.md) for more information on our MIT
license.
