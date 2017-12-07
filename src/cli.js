/*
 * Copyright (C) 2017 Alasdair Mercer, !ninja
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

// TODO: Complete

const { Command } = require('commander');
const fs = require('fs');
const os = require('os');
const path = require('path');
const util = require('util');

const native2ascii = require('./native2ascii');
const { version } = require('../package.json');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

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

// TODO: Document
async function parse(argv, options) {
  options = parseOptions(options);

  const command = new Command('native2ascii')
    .arguments('[inputFile] [outputFile]')
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

// TODO: Document
function parseOptions(options) {
  return Object.assign({
    cwd: process.cwd(),
    eol: os.EOL,
    stderr: process.stderr,
    stdin: process.stdin,
    stdout: process.stdout
  }, options);
}

// TODO: Document
async function readInput(file, encoding, options) {
  let buffer;
  if (file) {
    buffer = await readFile(path.resolve(options.cwd, file));
  } else {
    buffer = await readStdin(options);
  }

  return buffer.toString(encoding);
}

// TODO: Document
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

// TODO: Document
function writeError(message, options) {
  options = parseOptions(options);

  options.stderr.write(`${message}${options.eol}`);
}

// TODO: Document
async function writeOutput(output, file, encoding, options) {
  if (file) {
    await writeFile(path.resolve(options.cwd, file), output, encoding);
  } else {
    await writeStdout(output, encoding, options);
  }
}

// TODO: Document
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
