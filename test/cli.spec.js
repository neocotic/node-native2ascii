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
const sinon = require('sinon');
const { Readable, Writable } = require('stream');
const util = require('util');

const cli = require('../src/cli');
const { version } = require('../package.json');

const readFile = util.promisify(fs.readFile);

describe('cli', () => {
  class MockReadable extends Readable {

    constructor(buffer, options) {
      super(options);

      this.buffer = buffer || Buffer.alloc(0);
      this._bufferRead = false;
    }

    _read() {
      if (this._bufferRead) {
        this.push(null);
      } else {
        this.push(this.buffer);

        this._bufferRead = true;
      }
    }

  }

  class MockWritable extends Writable {

    constructor(options) {
      super(options);

      this.buffer = Buffer.alloc(0);
      this._length = 0;
    }

    _write(chunk, encoding, callback) {
      this._length += chunk.length;
      this.buffer = Buffer.concat([ this.buffer, Buffer.from(chunk, encoding) ], this._length);

      callback();
    }

  }

  let options;

  beforeEach(() => {
    options = {
      cwd: __dirname,
      eol: '\n',
      stderr: new MockWritable(),
      stdin: new MockReadable(),
      stdout: new MockWritable()
    };
  });

  describe('.parse', () => {
    // TODO: Complete
    context('when --help option is included in argv', () => {
      function cleanUp() {
        if (process.exit.restore) {
          process.exit.restore();
        }
        if (process.stdout.write.restore) {
          process.stdout.write.restore();
        }
      }

      beforeEach(() => {
        sinon.stub(process, 'exit');
        sinon.stub(process.stdout, 'write');
      });

      afterEach(cleanUp);

      it('should print help information and exit', async() => {
        process.exit.throws();

        try {
          await cli.parse([ null, null, '--help' ], options);
        } catch (e) {
          expect(process.stdout.write.callCount).to.equal(1);
          expect(process.stdout.write.getCall(0).args).to.deep.equal([
            `
  Usage: native2ascii [options] [inputFile] [outputFile]


  Options:

    -e, --encoding <encoding>  specify encoding to be used by the conversion procedure
    -r, --reverse              perform reverse operation
    -V, --version              output the version number
    -h, --help                 output usage information
`
          ]);
          expect(process.exit.callCount).to.be.at.least(1);
          expect(process.exit.getCall(0).args).to.deep.equal([ 0 ]);
        } finally {
          cleanUp();
        }
      });
    });

    context('when --version option is included in argv', () => {
      function cleanUp() {
        if (process.exit.restore) {
          process.exit.restore();
        }
        if (process.stdout.write.restore) {
          process.stdout.write.restore();
        }
      }

      beforeEach(() => {
        sinon.stub(process, 'exit');
        sinon.stub(process.stdout, 'write');
      });

      afterEach(cleanUp);

      it('should print version and exit', async() => {
        process.exit.throws();

        try {
          await cli.parse([ null, null, '--version' ], options);
        } catch (e) {
          expect(process.stdout.write.callCount).to.equal(1);
          expect(process.stdout.write.getCall(0).args).to.deep.equal([
            `${version}
`
          ]);
          expect(process.exit.callCount).to.be.at.least(1);
          expect(process.exit.getCall(0).args).to.deep.equal([ 0 ]);
        } finally {
          cleanUp();
        }
      });
    });
  });

  describe('.writeError', () => {
    it('should write message to stderr', () => {
      cli.writeError('foo', options);

      expect(options.stderr.buffer.toString()).to.equal('foo\n');
    });
  });
});
