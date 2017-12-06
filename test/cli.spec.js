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

const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
const { Writable } = require('stream');
const util = require('util');

const cli = require('../src/cli');

const readFile = util.promisify(fs.readFile);

describe('cli', () => {
  class MockWritable extends Writable {

    constructor(options) {
      super(options);

      this.buffer = Buffer.alloc(0);
      this.length = 0;
    }

    _write(chunk, encoding, callback) {
      this.length += chunk.length;
      this.buffer = Buffer.concat([ this.buffer, Buffer.from(chunk, encoding) ], this.length);

      callback();
    }

  }

  let options;

  beforeEach(() => {
    options = {
      cwd: __dirname,
      eol: '\n',
      stderr: new MockWritable(),
      // TODO: Create MockReadable
      stdin: null,
      stdout: new MockWritable()
    };
  });

  describe('.parse', () => {
    // TODO: Complete
  });

  describe('.writeError', () => {
    it('should write message to stderr', () => {
      cli.writeError('foo', options);

      expect(options.stderr.buffer.toString()).to.equal('foo\n');
    });
  });
});
