/*
 * Copyright (C) 2025 neocotic
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

import { escapeUnicode, isNotAscii } from "escape-unicode";
import { unescapeUnicode } from "unescape-unicode";

/**
 * The options that can be provided to {@link native2ascii}.
 */
export interface Options {
  /**
   * Whether the reverse the conversion.
   *
   * If not specified, defaults to `false`.
   */
  reverse?: boolean;
}

/**
 * Converts characters within `input` so that it can be encoded in ASCII by using Unicode escapes ("\uxxxx" notation)
 * for all characters that are not part of the ASCII character set.
 *
 * This can be useful when dealing with `.properties` files and characters that are not in the ISO-8859-1 character set.
 *
 * {@link Options#reverse} can be specified to reverse the conversion and instead convert Unicode escapes to their
 * corresponding Unicode characters.
 *
 * Characters within the Basic Multilingual Plane (BMP) as well as surrogate pairs for characters outside BMP are
 * supported.
 *
 * @example Escape only non-ASCII characters
 * native2ascii("I ♥ Unicode!");
 * //=> "I \\u2665 Unicode!"
 * @example Escape characters outside BMP
 * native2ascii("𠮷𠮾");
 * //=> "\\ud842\\udfb7\\ud842\\udfbe"
 * @example Unescape all Unicode escapes
 * native2ascii("I \\u2665 Unicode!", { reverse: true });
 * //=> "I ♥ Unicode!"
 * @example Unescape all Unicode escapes for characters outside BMP
 * native2ascii("\\ud842\\udfb7\\ud842\\udfbe", { reverse: true });
 * //=> "𠮷𠮾"
 * @param input The string to be converted.
 * @param options The options to be used.
 * @return A copy of `input` with the appropriate characters replaced with Unicode escapes (or vice versa if reversed).
 */
export const native2ascii = (input: string, options: Options = {}): string => {
  if (!input) {
    return "";
  }
  if (options.reverse) {
    return unescapeUnicode(input);
  }
  return escapeUnicode(input, { filter: isNotAscii });
};
