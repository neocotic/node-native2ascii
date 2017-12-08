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

/* eslint complexity: "off" */

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
    let ch = input.charAt(i);

    if (ch === '\\') {
      ch = input.charAt(++i);

      if (ch === 'u') {
        result += getUnicode(input, i + 1);
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

/**
 * Attempts to convert the Unicode escape within <code>input</code> at the specified <code>offset</code>.
 *
 * <code>offset</code> should be the index of the first character after the "\u" prefix of the Unicode escape and will
 * result in the offset being increased as it reads in the next four characters within <code>input</code>.
 *
 * This function will throw an error if the hexadecimal value corresponding to the Unicode escape at the specified
 * <code>offset</code> is malformed.
 *
 * @param {string} input - the string to be converted
 * @param {number} offset - the offset of the hexadecimal segment of the Unicode escape from which the Unicode character
 * is to be derived relative to <code>input</code>
 * @return {string} The Unicode character converted from the escape at <code>offset</code> within <code>input</code>.
 * @throws {Error} If the Unicode escape is malformed.
 */
function getUnicode(input, offset) {
  let unicode = 0;

  for (let i = offset, end = offset + 4; i < end; i++) {
    const ch = input.charAt(i);
    const code = ch.charCodeAt(0);

    switch (ch) {
    case '0':
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
    case '7':
    case '8':
    case '9':
      unicode = (unicode << 4) + code - 0x30;
      break;
    case 'A':
    case 'B':
    case 'C':
    case 'D':
    case 'E':
    case 'F':
      unicode = (unicode << 4) + 10 + code - 0x41;
      break;
    case 'a':
    case 'b':
    case 'c':
    case 'd':
    case 'e':
    case 'f':
      unicode = (unicode << 4) + 10 + code - 0x61;
      break;
    default:
      throw new Error(`Malformed character found in \\uxxxx encoding: ${ch}`);
    }
  }

  return String.fromCharCode(unicode);
}

module.exports = unescape;
