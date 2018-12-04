/*
 * Copyright (C) 2018 Alasdair Mercer
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

'use strict';

const { Command } = require('commander');
const fs = require('fs');
const os = require('os');
const path = require('path');
const util = require('util');

const native2ascii = require('./native2ascii');
const { version } = require('../package.json');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

/**
 * Determines the character encodings to be used to read input and write output based on the specified
 * <code>command</code>.
 *
 * This function will throw an error if <code>command.encoding</code> is specified but is not a valid character
 * encoding.
 *
 * @param {Command} command - the <code>Command</code> for the parsed arguments
 * @return {cli~Encodings} The character encodings to be used.
 * @throws {Error} If <code>command.encoding</code> is specified but is invalid.
 */
function getEncodings(command) {
  if (command.encoding && !Buffer.isEncoding(command.encoding)) {
    throw new Error(`Invalid encoding: ${command.encoding}`);
  }

  const asciiEncoding = 'latin1';
  const nativeEncoding = command.encoding || 'utf8';
  let inputEncoding;
  let outputEncoding;

  if (command.reverse) {
    inputEncoding = asciiEncoding;
    outputEncoding = nativeEncoding;
  } else {
    inputEncoding = nativeEncoding;
    outputEncoding = asciiEncoding;
  }

  return { inputEncoding, outputEncoding };
}

/**
 * Parses the command line arguments and performs the necessary operation.
 *
 * The primary operation is to convert a file that is encoded to any character encoding that is supported by Node.js
 * (which can be controlled via the "encoding" command line option) to a file encoded in ASCII, using Unicode escapes
 * ("\uxxxx" notation) for all characters that are not part of the ASCII character set.
 *
 * This command is useful for properties files containing characters not in ISO-8859-1 character sets.
 *
 * A reverse conversion can be performed by passing the "reverse" command line option.
 *
 * If the "outputfile" command line argument is omitted, standard output is used for output. If, in addition, the
 * "inputfile" command line argument is omitted, standard input is used for input.
 *
 * The Node.js process may exist as a result if calling this function, depending on how <code>argv</code> are parsed.
 *
 * Optionally, <code>options</code> can be specified for additional control, however, this is primarily intended for
 * testing purposes only.
 *
 * @param {string[]} argv - the command line arguments to be parsed
 * @param {?cli~Options} [options] - the options to be used (may be <code>null</code>)
 * @return {Promise.<void, Error>} A <code>Promise</code> that is resolved once the conversion operation has completed,
 * if needed.
 */
async function parse(argv, options) {
  options = parseOptions(options);

  const command = new Command('native2ascii')
    .arguments('[inputfile] [outputfile]')
    .option('-e, --encoding <encoding>', 'specify encoding to be used by the conversion procedure')
    .option('-r, --reverse', 'perform reverse operation')
    .version(version)
    .parse(argv);

  const native2asciiOptions = { reverse: Boolean(command.reverse) };
  const { inputEncoding, outputEncoding } = getEncodings(command);
  const [ inputFile, outputFile ] = command.args;
  const input = await readInput(inputFile, inputEncoding, options);
  const output = native2ascii(input, native2asciiOptions);

  await writeOutput(output, outputFile, outputEncoding, options);
}

/**
 * Parses the specified <code>options</code>, using default values where needed.
 *
 * This function does not modify <code>options</code> but, instead, returns a new object based on it.
 *
 * @param {?cli~Options} options - the options to be parsed (may be <code>null</code>)
 * @return {cli~Options} The parsed options.
 */
function parseOptions(options) {
  return Object.assign({
    cwd: process.cwd(),
    eol: os.EOL,
    stderr: process.stderr,
    stdin: process.stdin,
    stdout: process.stdout
  }, options);
}

/**
 * Reads the input to be converted as a string using the character <code>encoding</code> provided.
 *
 * If <code>file</code> is specified, its contents are read as the input. Otherwise, the input is read directly from
 * STDIN.
 *
 * @param {?string} file - the input file to be read (may be <code>null</code>)
 * @param {string} encoding - the character encoding to be used to read the input
 * @param {cli~Options} options - the options to be used
 * @return {Promise.<string, Error>} A <code>Promise</code> that is resolved with the input to be converted.
 */
async function readInput(file, encoding, options) {
  let buffer;
  if (file) {
    buffer = await readFile(path.resolve(options.cwd, file));
  } else {
    buffer = await readStdin(options);
  }

  return buffer.toString(encoding);
}

/**
 * Reads the input from STDIN.
 *
 * @param {cli~Options} options - the options to be used
 * @return {Promise.<Buffer, Error>} A <code>Promise</code> that is resolved with the input read from STDIN.
 */
function readStdin(options) {
  const { stdin } = options;
  const data = [];
  let length = 0;

  return new Promise((resolve, reject) => {
    if (stdin.isTTY) {
      resolve(Buffer.alloc(0));
    } else {
      stdin.on('error', (error) => {
        reject(error);
      });

      stdin.on('readable', () => {
        let chunk;

        while ((chunk = stdin.read()) != null) {
          data.push(chunk);
          length += chunk.length;
        }
      });

      stdin.on('end', () => {
        resolve(Buffer.concat(data, length));
      });
    }
  });
}

/**
 * Writes the specified <code>message</code> to STDERR.
 *
 * @param {string} message - the error message to be written
 * @param {?cli~Options} [options] - the options to be used (may be <code>null</code>)
 * @return {void}
 */
function writeError(message, options) {
  options = parseOptions(options);

  options.stderr.write(`${message}${options.eol}`);
}

/**
 * Writes the specified <code>output</code> as a string using the character <code>encoding</code> provided.
 *
 * If <code>file</code> is specified, <code>output</code> will be written to it. Otherwise, <code>output</code> is
 * written directly to STDOUT.
 *
 * @param {string} output - the output to be written
 * @param {?string} file - the file to which <code>output</code> should be written (may be <code>null</code>)
 * @param {string} encoding - the character encoding to be used to write <code>output</code>
 * @param {cli~Options} options - the options to be used
 * @return {Promise.<void, Error>} A <code>Promise</code> that is resolved once <code>output</code> has be written.
 */
async function writeOutput(output, file, encoding, options) {
  if (file) {
    await writeFile(path.resolve(options.cwd, file), output, encoding);
  } else {
    await writeStdout(output, encoding, options);
  }
}

/**
 * Writes the specified <code>output</code> to STDOUT using the character <code>encoding</code> provided.
 *
 * @param {string} output - the output to be written to STDOUT
 * @param {string} encoding - the character encoding to be used to write <code>output</code>
 * @param {cli~Options} options - the options to be used
 * @return {Promise.<void, Error>} A <code>Promise</code> that is resolved once <code>output</code> has be written to
 * STDOUT.
 */
function writeStdout(output, encoding, options) {
  const { stdout } = options;

  return new Promise((resolve, reject) => {
    stdout.on('error', (error) => {
      reject(error);
    });

    stdout.on('finish', () => {
      resolve();
    });

    stdout.end(output, encoding);
  });
}

module.exports = {
  parse,
  writeError
};

/**
 * Contains the character encodings to be used when reading input and writing output.
 *
 * @typedef {Object} cli~Encodings
 * @property {string} inputEncoding - The character encoding to be used when reading input.
 * @property {string} outputEncoding - The character encoding to be used when writing output.
 */

/**
 * The options that can be passed to {@link parse}.
 *
 * @typedef {Object} cli~Options
 * @property {string} [cwd=process.cwd()] - The current working directory to be used.
 * @property {string} [eol=os.EOL] - The end-of-line character to be used.
 * @property {Writable} [stderr=process.stderr] - The stream to which standard errors may be written.
 * @property {Readable} [stdin=process.stdin] - The stream from which standard input may be read.
 * @property {Writable} [stdout=process.stdout] - The stream to which standard output may be written.
 */
