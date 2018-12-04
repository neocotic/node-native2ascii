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

const escape = require('../../src/unicode/escape');

const readFile = util.promisify(fs.readFile);

describe('unicode/escape', () => {
  it('should not escape any characters within ASCII character set', async() => {
    const input = await readFile(path.resolve(__dirname, '../fixtures/unescaped/ascii.txt'), 'ascii');
    const expected = await readFile(path.resolve(__dirname, '../fixtures/escaped/latin1-from-ascii.txt'), 'ascii');
    const actual = escape(input);

    assert.equal(actual, expected);
  });

  it('should only escape non-ASCII characters within ISO-8859-1 character set', async() => {
    const input = await readFile(path.resolve(__dirname, '../fixtures/unescaped/latin1.txt'), 'latin1');
    const expected = await readFile(path.resolve(__dirname, '../fixtures/escaped/latin1-from-latin1.txt'), 'latin1');
    const actual = escape(input);

    assert.equal(actual, expected);
  });

  it('should only escape non-ASCII characters within UTF-8 character set', async() => {
    const input = await readFile(path.resolve(__dirname, '../fixtures/unescaped/utf8.txt'), 'utf8');
    const expected = await readFile(path.resolve(__dirname, '../fixtures/escaped/latin1-from-utf8.txt'), 'latin1');
    const actual = escape(input);

    assert.equal(actual, expected);
  });

  context('when input is empty', () => {
    it('should return empty string', () => {
      const expected = '';
      const actual = escape('');

      assert.equal(actual, expected);
    });
  });
});
