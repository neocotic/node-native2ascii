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
const util = require('util');

const unescape = require('../../src/unicode/unescape');

const readFile = util.promisify(fs.readFile);

describe('unicode/unescape', () => {
  it('should not unescape any characters within ASCII character set', async() => {
    const input = await readFile(path.resolve(__dirname, '../fixtures/escaped/latin1-from-ascii.txt'), 'ascii');
    const expected = await readFile(path.resolve(__dirname, '../fixtures/unescaped/ascii.txt'), 'ascii');
    const actual = unescape(input);

    expect(actual).to.equal(expected);
  });

  it('should only unescape escaped unicode values within ISO-8859-1 character set', async() => {
    const input = await readFile(path.resolve(__dirname, '../fixtures/escaped/latin1-from-latin1.txt'), 'latin1');
    const expected = await readFile(path.resolve(__dirname, '../fixtures/unescaped/latin1.txt'), 'latin1');
    const actual = unescape(input);

    expect(actual).to.equal(expected);
  });

  it('should only unescape escaped unicode values within UTF-8 character set', async() => {
    const input = await readFile(path.resolve(__dirname, '../fixtures/escaped/latin1-from-utf8.txt'), 'utf8');
    const expected = await readFile(path.resolve(__dirname, '../fixtures/unescaped/utf8.txt'), 'utf8');
    const actual = unescape(input);

    expect(actual).to.equal(expected);
  });

  it('should ignore case when unescaping escaped unicode values', () => {
    const expected = '\u001a\u001b\u001c\u001d\u001e\u001f';
    const actual = unescape('\\u001A\\u001B\\u001C\\u001D\\u001E\\u001F');

    expect(actual).to.equal(expected);
  });

  context('when input is empty', () => {
    it('should return empty string', () => {
      const expected = '';
      const actual = unescape('');

      expect(actual).to.equal(expected);
    });
  });

  context('when input contains invalid escaped unicode value', () => {
    it('should throw an error', () => {
      expect(() => {
        unescape('\\u00ah');
      }).to.throw(Error, 'Unexpected character "h" found at 5');

      expect(() => {
        unescape('\\u00a');
      }).to.throw(Error, 'Insufficient characters found: -1');
    });
  });
});
