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

import * as assert from "node:assert";
import { readFile } from "node:fs/promises";
import { resolve as resolvePath } from "node:path";
import { before, describe, it } from "node:test";
import { native2ascii } from "../src/native2ascii.js";

describe("native2ascii", () => {
  let escapedLatin1: string;
  let unescapedUtf8: string;

  before(async () => {
    escapedLatin1 = await readFile(
      resolvePath(
        import.meta.dirname,
        "./fixtures/escaped/latin1-from-utf8.txt",
      ),
      "latin1",
    );
    unescapedUtf8 = await readFile(
      resolvePath(import.meta.dirname, "./fixtures/unescaped/utf8.txt"),
      "utf8",
    );
  });

  it("should only convert non-ASCII characters to Unicode escapes", () => {
    const input = unescapedUtf8;
    const expected = escapedLatin1;
    const actual = native2ascii(input);

    assert.strictEqual(actual, expected);
  });

  describe("when input is empty", () => {
    it("should return an empty string", () => {
      const expected = "";
      const actual = native2ascii("");

      assert.strictEqual(actual, expected);
    });
  });

  describe("when reverse option is disabled", () => {
    it("should only convert non-ASCII characters to Unicode escapes", () => {
      const input = unescapedUtf8;
      const expected = escapedLatin1;
      const actual = native2ascii(input, { reverse: false });

      assert.strictEqual(actual, expected);
    });

    describe("and input is empty", () => {
      it("should return an empty string", () => {
        const expected = "";
        const actual = native2ascii("", { reverse: false });

        assert.strictEqual(actual, expected);
      });
    });
  });

  describe("when reverse option is enabled", () => {
    it("should convert Unicode escapes to corresponding characters", () => {
      const input = escapedLatin1;
      const expected = unescapedUtf8;
      const actual = native2ascii(input, { reverse: true });

      assert.strictEqual(actual, expected);
    });

    describe("and input is empty", () => {
      it("should return an empty string", () => {
        const expected = "";
        const actual = native2ascii("", { reverse: true });

        assert.strictEqual(actual, expected);
      });
    });
  });
});
