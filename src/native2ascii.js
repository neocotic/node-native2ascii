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

const { escape, unescape } = require('./unicode');

/**
 * Converts the specified <code>input</code> so that it can be encoded in ASCII by using Unicode escapes ("\uxxxx"
 * notation) for all characters that are not part of the ASCII character set.
 *
 * This function is useful for properties files containing characters not in ISO-8859-1 character sets.
 *
 * A reverse conversion can be performed by enabling the <code>reverse</code> option.
 *
 * This function will throw an error when performing a reverse conversion if <code>input</code> contains a malformed
 * Unicode escape.
 *
 * @param {?string} input - the string to be converted (may be <code>null</code>)
 * @param {?native2ascii~Options} [options] - the options to be used (may be <code>null</code>)
 * @return {?string} The converted output from <code>input</code> or
 * <code>null</code> if <code>input</code> is <code>null</code>.
 * @throws {Error} If the <code>reverse</code> option is enabled and <code>input</code> contains a malformed Unicode
 * escape.
 */
function native2ascii(input, options) {
  if (input == null) {
    return input;
  }

  options = Object.assign({ reverse: false }, options);

  const converter = options.reverse ? unescape : escape;

  return converter(input);
}

module.exports = native2ascii;

/**
 * The options that can be passed to {@link native2ascii}.
 *
 * @typedef {Object} native2ascii~Options
 * @property {?boolean} [reverse] - <code>true</code> to reverse the operation; otherwise <code>false</code>. May be
 * <code>null</code>.
 */
