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
  let escaped;

  before(async() => {
    escaped = await readFile(path.resolve(__dirname, '../fixtures/escaped/latin1.txt'), 'latin1');
  });

  it('should not attempt to unescape ascii characters', async() => {
    const expected = await readFile(path.resolve(__dirname, '../fixtures/unescaped/ascii.txt'), 'ascii');
    const actual = unescape(expected);

    expect(actual).to.equal(expected);
  });

  it('should not attempt to unescape latin1 characters', async() => {
    const expected = await readFile(path.resolve(__dirname, '../fixtures/unescaped/latin1.txt'), 'latin1');
    const actual = unescape(expected);

    expect(actual).to.equal(expected);
  });

  it('should unescape all escaped unicode values', async() => {
    const expected = await readFile(path.resolve(__dirname, '../fixtures/unescaped/utf8.txt'), 'utf8');
    const actual = unescape(escaped);

    expect(actual).to.equal(expected);
  });

  context('when string is empty', () => {
    it('should return empty string', () => {
      const expected = '';
      const actual = unescape('');

      expect(actual).to.equal(expected);
    });
  });

  context('when string contains invalid escaped unicode value', () => {
    it('should throw an error', () => {
      expect(() => {
        unescape('\\u00ah');
      }).to.throw(Error, 'Unable to parse unicode: 00ah');
    });
  });
});
