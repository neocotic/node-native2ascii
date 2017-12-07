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

const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
const sinon = require('sinon');
const { Readable, Writable } = require('stream');
const tmp = require('tmp');
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
      if (this.buffer.length === 0) {
        this._bufferRead = true;
      }

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
    context('when no files are included in argv', () => {
      it('should escape all non-ASCII characters read from STDIN and write to STDOUT', async() => {
        const input = await readFile(path.resolve(__dirname, './fixtures/unescaped/utf8.txt'));
        const expected = await readFile(path.resolve(__dirname, './fixtures/escaped/latin1-from-utf8.txt'));

        options.stdin.buffer = input;

        await cli.parse([ null, null ], options);

        expect(options.stdout.buffer).to.deep.equal(expected);
      });

      context('and STDIN is empty', () => {
        it('should write empty buffer to STDOUT', async() => {
          const expected = Buffer.alloc(0);

          await cli.parse([ null, null ], options);

          expect(options.stdout.buffer).to.deep.equal(expected);
        });
      });

      context('and --encoding option is included in argv', () => {
        it('should escape all non-ASCII characters read from STDIN and write to STDOUT', async() => {
          const input = await readFile(path.resolve(__dirname, './fixtures/unescaped/latin1.txt'));
          const expected = await readFile(path.resolve(__dirname, './fixtures/escaped/latin1-from-latin1.txt'));

          options.stdin.buffer = input;

          await cli.parse([
            null, null,
            '--encoding', 'latin1'
          ], options);

          expect(options.stdout.buffer).to.deep.equal(expected);
        });

        context('and value is invalid', () => {
          it('should throw an error', async() => {
            const input = await readFile(path.resolve(__dirname, './fixtures/unescaped/latin1.txt'));
            const expected = Buffer.alloc(0);

            options.stdin.buffer = input;

            try {
              await cli.parse([
                null, null,
                '--encoding', 'foo'
              ], options);
              // Should have thrown
              expect.fail();
            } catch (e) {
              expect(e).to.be.an('error');
              expect(e.message).to.equal('Invalid encoding: foo');
            }

            expect(options.stdout.buffer).to.deep.equal(expected);
          });
        });
      });

      context('and --reverse option is included in argv', () => {
        it('should unescape all escaped unicode values read from STDIN and write to STDOUT', async() => {
          const input = await readFile(path.resolve(__dirname, './fixtures/escaped/latin1-from-utf8.txt'));
          const expected = await readFile(path.resolve(__dirname, './fixtures/unescaped/utf8.txt'));

          options.stdin.buffer = input;

          await cli.parse([
            null, null,
            '--reverse'
          ], options);

          expect(options.stdout.buffer).to.deep.equal(expected);
        });
      });

      context('and both --encoding and --reverse options are included in argv', () => {
        it('should unescape all escaped unicode values read from STDIN and write to STDOUT', async() => {
          const input = await readFile(path.resolve(__dirname, './fixtures/escaped/latin1-from-latin1.txt'));
          const expected = await readFile(path.resolve(__dirname, './fixtures/unescaped/latin1.txt'));

          options.stdin.buffer = input;

          await cli.parse([
            null, null,
            '--encoding', 'latin1',
            '--reverse'
          ], options);

          expect(options.stdout.buffer).to.deep.equal(expected);
        });
      });
    });

    context('when input and output files are included in argv', () => {
      let outputFile;
      let removeOutputFile;

      beforeEach((done) => {
        tmp.file((error, filePath, fd, cleanUp) => {
          if (error) {
            done(error);
          } else {
            outputFile = filePath;
            removeOutputFile = cleanUp;

            done();
          }
        });
      });

      afterEach(() => {
        removeOutputFile();
      });

      it('should escape all non-ASCII characters read from input file and write to output file', async() => {
        await cli.parse([
          null, null,
          path.resolve(__dirname, './fixtures/unescaped/utf8.txt'),
          outputFile
        ], options);

        const actual = await readFile(outputFile);
        const expected = await readFile(path.resolve(__dirname, './fixtures/escaped/latin1-from-utf8.txt'));

        expect(actual).to.deep.equal(expected);
      });

      context('and input file is empty', () => {
        it('should write empty buffer to output file', async() => {
          await cli.parse([
            null, null,
            path.resolve(__dirname, './fixtures/empty.txt'),
            outputFile
          ], options);

          const actual = await readFile(outputFile);
          const expected = Buffer.alloc(0);

          expect(actual).to.deep.equal(expected);
        });
      });

      context('and --encoding option is included in argv', () => {
        it('should escape all non-ASCII characters read from input file and write to output file', async() => {
          await cli.parse([
            null, null,
            '--encoding', 'latin1',
            path.resolve(__dirname, './fixtures/unescaped/latin1.txt'),
            outputFile
          ], options);

          const actual = await readFile(outputFile);
          const expected = await readFile(path.resolve(__dirname, './fixtures/escaped/latin1-from-latin1.txt'));

          expect(actual).to.deep.equal(expected);
        });

        context('and value is invalid', () => {
          it('should throw an error', async() => {
            try {
              await cli.parse([
                null, null,
                '--encoding', 'foo',
                path.resolve(__dirname, './fixtures/unescaped/latin1.txt'),
                outputFile
              ], options);
              // Should have thrown
              expect.fail();
            } catch (e) {
              expect(e).to.be.an('error');
              expect(e.message).to.equal('Invalid encoding: foo');
            }

            const actual = await readFile(outputFile);
            const expected = Buffer.alloc(0);

            expect(actual).to.deep.equal(expected);
          });
        });
      });

      context('and --reverse option is included in argv', () => {
        it('should unescape all escaped unicode values read from imput file and write to output file', async() => {
          await cli.parse([
            null, null,
            '--reverse',
            path.resolve(__dirname, './fixtures/escaped/latin1-from-utf8.txt'),
            outputFile
          ], options);

          const actual = await readFile(outputFile);
          const expected = await readFile(path.resolve(__dirname, './fixtures/unescaped/utf8.txt'));

          expect(actual).to.deep.equal(expected);
        });
      });

      context('and both --encoding and --reverse options are included in argv', () => {
        it('should unescape all escaped unicode values read from imput file and write to output file', async() => {
          await cli.parse([
            null, null,
            '--encoding', 'latin1',
            '--reverse',
            path.resolve(__dirname, './fixtures/escaped/latin1-from-latin1.txt'),
            outputFile
          ], options);

          const actual = await readFile(outputFile);
          const expected = await readFile(path.resolve(__dirname, './fixtures/unescaped/latin1.txt'));

          expect(actual).to.deep.equal(expected);
        });
      });
    });

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
          await cli.parse([
            null, null,
            '--help'
          ], options);
          // Stubbed process.exit should have thrown
          expect.fail();
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
          await cli.parse([
            null, null,
            '--version'
          ], options);
          // Stubbed process.exit should have thrown
          expect.fail();
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
