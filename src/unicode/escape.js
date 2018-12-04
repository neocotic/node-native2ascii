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

const escapeUnicode = require('escape-unicode');

/**
 * Converts all Unicode characters within the specifed <code>input</code> to Unicode escapes ("\uxxxx" notation).
 *
 * @param {string} input - the string to be converted
 * @return {string} The converted output from <code>input</code>.
 */
function escape(input) {
  let result = '';

  for (let i = 0, length = input.length; i < length; i++) {
    const code = input.charCodeAt(i);

    if (code > 0x7f) {
      result += escapeUnicode(input, i, i + 1);
    } else {
      result += input[i];
    }
  }

  return result;
}

module.exports = escape;
