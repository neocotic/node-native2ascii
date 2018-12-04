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

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const util = require('util');

const native2ascii = require('../src/native2ascii');

const readFile = util.promisify(fs.readFile);

describe('native2ascii', () => {
  context('when input is null', () => {
    it('should return null', () => {
      assert.strictEqual(native2ascii(null), null);
    });
  });

  context('when input is undefined', () => {
    it('should return undefined', () => {
      /* eslint-disable no-undefined */
      assert.strictEqual(native2ascii(undefined), undefined);
      /* eslint-enable no-undefined */
    });
  });

  context('when no options are specified', () => {
    it('should escape all non-ASCII characters within input', async() => {
      const input = await readFile(path.resolve(__dirname, './fixtures/unescaped/utf8.txt'), 'utf8');
      const expected = await readFile(path.resolve(__dirname, './fixtures/escaped/latin1-from-utf8.txt'), 'latin1');
      const actual = native2ascii(input);

      assert.equal(actual, expected);
    });

    context('and input is empty', () => {
      it('should return an empty string', () => {
        const expected = '';
        const actual = native2ascii('');

        assert.equal(actual, expected);
      });
    });
  });

  context('when "reverse" option is disabled', () => {
    it('should escape all non-ASCII characters within input', async() => {
      const input = await readFile(path.resolve(__dirname, './fixtures/unescaped/utf8.txt'), 'utf8');
      const expected = await readFile(path.resolve(__dirname, './fixtures/escaped/latin1-from-utf8.txt'), 'latin1');
      const actual = native2ascii(input, { reverse: false });

      assert.equal(actual, expected);
    });

    context('and input is empty', () => {
      it('should return an empty string', () => {
        const expected = '';
        const actual = native2ascii('', { reverse: false });

        assert.equal(actual, expected);
      });
    });
  });

  context('when "reverse" option is enabled', () => {
    it('should unescape all escaped unicode values within input', async() => {
      const input = await readFile(path.resolve(__dirname, './fixtures/escaped/latin1-from-utf8.txt'), 'latin1');
      const expected = await readFile(path.resolve(__dirname, './fixtures/unescaped/utf8.txt'), 'utf8');
      const actual = native2ascii(input, { reverse: true });

      assert.equal(actual, expected);
    });

    context('and input is empty', () => {
      it('should return an empty string', () => {
        const expected = '';
        const actual = native2ascii('', { reverse: true });

        assert.equal(actual, expected);
      });
    });
  });
});
