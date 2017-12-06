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

// TODO: Complete

// TODO: Document
function unescape(input) {
  let hadSlash = false;
  let inUnicode = false;
  let result = '';
  let unicode = '';

  for (let i = 0, length = input.length; i < length; i++) {
    const ch = input.charAt(i);

    if (inUnicode) {
      unicode += ch;

      if (unicode.length === 4) {
        const code = Number(`0x${unicode}`);
        if (Number.isNaN(code)) {
          throw new Error(`Unable to parse unicode: ${unicode}`);
        }

        result += String.fromCharCode(code);

        hadSlash = false;
        inUnicode = false;
        unicode = '';
      }

      continue;
    }

    if (hadSlash) {
      hadSlash = false;

      if (ch === 'u') {
        inUnicode = true;
      } else {
        result += `\\${ch}`;
      }

      continue;
    } else if (ch === '\\') {
      hadSlash = true;

      continue;
    }

    result += ch;
  }

  if (hadSlash) {
    result += '\\';
  }

  return result;
}

module.exports = unescape;
