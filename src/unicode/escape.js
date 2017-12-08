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

const hexDigits = [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f' ];

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
      result += `\\u${toHex(code)}`;
    } else {
      result += input.charAt(i);
    }
  }

  return result;
}

/**
 * Converts the specified character <code>code</code> to a hexadecimal value.
 *
 * @param {number} code - the character code to be converted
 * @return {string} The 4-digit hexadecimal string.
 */
function toHex(code) {
  return toHexDigit((code >> 12) & 15) +
    toHexDigit((code >> 8) & 15) +
    toHexDigit((code >> 4) & 15) +
    toHexDigit(code & 15);
}

/**
 * Converts the specified <code>nibble</code> to a hexadecimal digit.
 *
 * @param {number} nibble - the nibble to be converted
 * @return {string} The single-digit hexadecimal string.
 */
function toHexDigit(nibble) {
  return hexDigits[nibble & 15];
}

module.exports = escape;
