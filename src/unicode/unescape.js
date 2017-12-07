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

// TODO: Document
function unescape(input) {
  let result = '';

  for (let i = 0, length = input.length; i < length; i++) {
    let ch = input.charAt(i);

    if (ch === '\\') {
      ch = input.charAt(++i);

      if (ch === 'u') {
        result += getUnicode(input, i);
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

// TODO: Document
function getUnicode(input, offset) {
  offset++;

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
