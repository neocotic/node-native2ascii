/*
 * Copyright (C) 2018 Alasdair Mercer, !ninja
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

const unescapeUnicode = require('unescape-unicode');

/**
 * Converts all Unicode escapes ("\uxxxx" notation) within the specified <code>input</code> into their corresponding
 * Unicode characters.
 *
 * This function will throw an error if <code>input</code> contains a malformed Unicode escape.
 *
 * @param {string} input - the string to be converted
 * @return {string} The converted output from <code>input</code>.
 * @throws {Error} If <code>input</code> contains a malformed Unicode escape.
 */
function unescape(input) {
  let result = '';

  for (let i = 0, length = input.length; i < length; i++) {
    let ch = input[i];

    if (ch === '\\') {
      ch = input[++i];

      if (ch === 'u') {
        result += unescapeUnicode(input, i + 1);
        i += 4;
      } else {
        result += `\\${ch}`;
      }
    } else {
      result += ch;
    }
  }

  return result;
}

module.exports = unescape;
