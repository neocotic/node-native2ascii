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
import {
  access,
  constants as fsConstants,
  mkdtemp,
  readFile,
  rm,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join as joinPath, resolve as resolvePath } from "node:path";
import { Readable, type ReadableOptions, Writable } from "node:stream";
import {
  type Mock,
  afterEach,
  before,
  beforeEach,
  describe,
  it,
  mock,
} from "node:test";
import { ReadStream } from "node:tty";
import pkg from "../package.json" with { type: "json" };
import { fail, parse } from "../src/cli.js";

interface MockOptions {
  cwd: string;
  eol: string;
  exit: Mock<(code: number) => never>;
  stderr: MockWritable;
  stdin: Readable;
  stdout: MockWritable;
  version: string;
}

class MockWritable extends Writable {
  readonly error: Error | undefined;
  #buffer: Buffer = Buffer.alloc(0);
  #length: number = 0;

  constructor({ error }: { error?: Error } = {}) {
    super();

    this.error = error;
  }

  _write(
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    chunk: any,
    encoding: NodeJS.BufferEncoding,
    callback: (error?: Error | null) => void,
  ): void {
    if (this.error) {
      Error.captureStackTrace(this.error);
      callback(this.error);
      return;
    }

    this.#length += chunk.length;
    this.#buffer = Buffer.concat(
      [this.#buffer, Buffer.from(chunk, encoding)],
      this.#length,
    );

    callback();
  }

  get buffer(): Buffer {
    return this.#buffer;
  }
}

const helpOutput = `Usage: native2ascii [options] [input-file] [output-file]

Options:
  -e, --encoding <encoding>  specify encoding to use (default: "utf8")
  -r, --reverse              perform reverse conversion (default: false)
  -V, --version              output the version number
  -h, --help                 display help for command
`;

const mockArgv = Object.freeze([
  "/path/to/node/bin/node",
  "/path/to/node-native2ascii/dist/esm/bin.mjs",
]);

const versionOutput = `${pkg.version}
`;

const createMockExitError = () => new Error("exit");

const createMockOptions = ({
  exit,
  stderr = new MockWritable(),
  stdin = Readable.from(Buffer.alloc(0)),
  stdout = new MockWritable(),
}: {
  exit?: Mock<(code: number) => never>;
  stderr?: MockWritable;
  stdin?: Readable;
  stdout?: MockWritable;
} = {}): MockOptions => {
  if (!exit) {
    exit = mock.fn(() => {
      throw createMockExitError();
    });
  }

  return {
    cwd: import.meta.dirname,
    eol: "\n",
    exit,
    stderr,
    stdin,
    stdout,
    version: pkg.version,
  };
};

const createMockReadableToError = (
  error: Error,
  iterable: Iterable<unknown> | AsyncIterable<unknown> = Buffer.alloc(0),
  options?: ReadableOptions,
): Readable => {
  const stream = Readable.from(iterable, options);

  mock.method(
    stream,
    "read",
    () => {
      throw error;
    },
    { times: 1 },
  );

  return stream;
};

const createMockWritableToError = (error: Error): MockWritable =>
  new MockWritable({ error });

const createTempDir = (): Promise<string> =>
  mkdtemp(joinPath(tmpdir(), "native2ascii-test-"));

const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await access(filePath, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
};

describe("fail", () => {
  [
    {
      description: "when Error instance is passed",
      test: "should write stack trace to STDERR and exit process",
      error: new Error("bad"),
      expected: /^native2ascii failed: Error: bad\n(?:\s+at\s+.*\n)+$/,
    },
    {
      description: "when object with message property is passed",
      test: "should write message to STDERR and exit process",
      error: { message: "bad" },
      expected: /^native2ascii failed: bad\n$/,
    },
    {
      description: "when string is passed",
      test: "should write string to STDERR and exit process",
      error: "bad",
      expected: /^native2ascii failed: bad\n$/,
    },
  ].forEach(({ description, test, error, expected }) => {
    describe(description, () => {
      it(test, () => {
        const options = createMockOptions();

        assert.throws(() => fail(error, options), createMockExitError());

        assert.match(options.stderr.buffer.toString(), expected);
        assert.strictEqual(options.stdout.buffer.length, 0);

        assert.strictEqual(options.exit.mock.callCount(), 1);
        assert.deepStrictEqual(options.exit.mock.calls[0]?.arguments, [1]);
      });
    });
  });
});

describe("parse", () => {
  let empty: Buffer;
  let escapedLatin1FromUtf8: Buffer;
  let escapedLatin1FromLatin1: Buffer;
  let unescapedLatin1: Buffer;
  let unescapedUtf8: Buffer;

  before(async () => {
    empty = Buffer.alloc(0);
    escapedLatin1FromLatin1 = await readFile(
      resolvePath(
        import.meta.dirname,
        "./fixtures/escaped/latin1-from-latin1.txt",
      ),
    );
    escapedLatin1FromUtf8 = await readFile(
      resolvePath(
        import.meta.dirname,
        "./fixtures/escaped/latin1-from-utf8.txt",
      ),
    );
    unescapedLatin1 = await readFile(
      resolvePath(import.meta.dirname, "./fixtures/unescaped/latin1.txt"),
    );
    unescapedUtf8 = await readFile(
      resolvePath(import.meta.dirname, "./fixtures/unescaped/utf8.txt"),
    );
  });

  describe("when no files are included in argv", () => {
    it("should convert all non-ASCII characters read from STDIN and write to STDOUT", async () => {
      const input = unescapedUtf8;
      const expected = escapedLatin1FromUtf8;
      const options = createMockOptions({ stdin: Readable.from(input) });

      await parse([...mockArgv], options);

      assert.deepEqual(options.stdout.buffer, expected);
      assert.deepEqual(options.stderr.buffer, empty);

      assert.strictEqual(options.exit.mock.callCount(), 0);
    });

    describe("when STDIN is empty", () => {
      it("should print help information and exit", async () => {
        const options = createMockOptions();

        await assert.rejects(
          parse([...mockArgv], options),
          createMockExitError(),
        );

        assert.strictEqual(options.stdout.buffer.toString(), helpOutput);
        assert.deepEqual(options.stderr.buffer, empty);

        assert.strictEqual(options.exit.mock.callCount(), 1);
        assert.deepStrictEqual(options.exit.mock.calls[0]?.arguments, [0]);
      });
    });

    describe("when STDIN is TTY", () => {
      it("should print help information and exit", async () => {
        const options = createMockOptions({ stdin: new ReadStream(0) });

        await assert.rejects(
          parse([...mockArgv], options),
          createMockExitError(),
        );

        assert.strictEqual(options.stdout.buffer.toString(), helpOutput);
        assert.deepEqual(options.stderr.buffer, empty);

        assert.strictEqual(options.exit.mock.callCount(), 1);
        assert.deepStrictEqual(options.exit.mock.calls[0]?.arguments, [0]);
      });
    });

    describe("when failed to read from STDIN", () => {
      it("should reject", async () => {
        const input = unescapedUtf8;
        const expected = empty;
        const expectedError = new Error("bad");
        const stdin = createMockReadableToError(expectedError, input);
        const options = createMockOptions({ stdin });

        await assert.rejects(parse([...mockArgv], options), expectedError);

        assert.deepEqual(options.stdout.buffer, expected);
        assert.deepEqual(options.stderr.buffer, empty);

        assert.strictEqual(options.exit.mock.callCount(), 0);
      });
    });

    describe("when failed to write to STDOUT", () => {
      it("should reject", async () => {
        const input = unescapedUtf8;
        const expected = empty;
        const expectedError = new Error("bad");
        const stdout = createMockWritableToError(expectedError);
        const options = createMockOptions({
          stdin: Readable.from(input),
          stdout,
        });

        await assert.rejects(parse([...mockArgv], options), expectedError);

        assert.deepEqual(options.stdout.buffer, expected);
        assert.deepEqual(options.stderr.buffer, empty);

        assert.strictEqual(options.exit.mock.callCount(), 0);
      });
    });

    describe("when --encoding option is included in argv", () => {
      it("should convert all non-ASCII characters read from STDIN and write to STDOUT", async () => {
        const input = unescapedLatin1;
        const expected = escapedLatin1FromLatin1;
        const options = createMockOptions({ stdin: Readable.from(input) });

        await parse([...mockArgv, "--encoding", "latin1"], options);

        assert.deepEqual(options.stdout.buffer, expected);
        assert.deepEqual(options.stderr.buffer, empty);

        assert.strictEqual(options.exit.mock.callCount(), 0);
      });

      describe("when value is invalid", () => {
        it("should reject", async () => {
          const input = unescapedLatin1;
          const expected = empty;
          const options = createMockOptions({ stdin: Readable.from(input) });

          await assert.rejects(
            parse([...mockArgv, "--encoding", "bad"], options),
            new Error("Invalid encoding bad"),
          );

          assert.deepEqual(options.stdout.buffer, expected);
          assert.deepEqual(options.stderr.buffer, empty);

          assert.strictEqual(options.exit.mock.callCount(), 0);
        });
      });
    });

    describe("when --reverse option is included in argv", () => {
      it("should convert all Unicode escapes read from STDIN and write to STDOUT", async () => {
        const input = escapedLatin1FromUtf8;
        const expected = unescapedUtf8;
        const options = createMockOptions({ stdin: Readable.from(input) });

        await parse([...mockArgv, "--reverse"], options);

        assert.deepEqual(options.stdout.buffer, expected);
        assert.deepEqual(options.stderr.buffer, empty);

        assert.strictEqual(options.exit.mock.callCount(), 0);
      });
    });

    describe("when both --encoding and --reverse options are included in argv", () => {
      it("should convert all Unicode escapes read from STDIN and write to STDOUT", async () => {
        const input = escapedLatin1FromLatin1;
        const expected = unescapedLatin1;
        const options = createMockOptions({ stdin: Readable.from(input) });

        await parse(
          [...mockArgv, "--encoding", "latin1", "--reverse"],
          options,
        );

        assert.deepEqual(options.stdout.buffer, expected);
        assert.deepEqual(options.stderr.buffer, empty);

        assert.strictEqual(options.exit.mock.callCount(), 0);
      });
    });
  });

  describe("when input and output files are included in argv", () => {
    let outputDir: string;
    let outputFile: string;

    beforeEach(async () => {
      outputDir = await createTempDir();
      outputFile = joinPath(outputDir, "output.txt");
    });

    afterEach(async () => {
      await rm(outputDir, { force: true, recursive: true });
    });

    it("should convert all non-ASCII characters read from input file and write to output file", async () => {
      const options = createMockOptions();

      await parse(
        [...mockArgv, "./fixtures/unescaped/utf8.txt", outputFile],
        options,
      );

      const expected = escapedLatin1FromUtf8;
      const actual = await readFile(outputFile);

      assert.deepEqual(actual, expected);

      assert.deepEqual(options.stdout.buffer, empty);
      assert.deepEqual(options.stderr.buffer, empty);

      assert.strictEqual(options.exit.mock.callCount(), 0);
    });

    describe("when input file is empty", () => {
      it("should write empty buffer to output file", async () => {
        const options = createMockOptions();

        await parse([...mockArgv, "./fixtures/empty.txt", outputFile], options);

        const expected = empty;
        const actual = await readFile(outputFile);

        assert.deepEqual(actual, expected);

        assert.deepEqual(options.stdout.buffer, empty);
        assert.deepEqual(options.stderr.buffer, empty);

        assert.strictEqual(options.exit.mock.callCount(), 0);
      });
    });

    describe("when --encoding option is included in argv", () => {
      it("should convert all non-ASCII characters read from input file and write to output file", async () => {
        const options = createMockOptions();

        await parse(
          [
            ...mockArgv,
            "--encoding",
            "latin1",
            "./fixtures/unescaped/latin1.txt",
            outputFile,
          ],
          options,
        );

        const expected = escapedLatin1FromLatin1;
        const actual = await readFile(outputFile);

        assert.deepEqual(actual, expected);

        assert.deepEqual(options.stdout.buffer, empty);
        assert.deepEqual(options.stderr.buffer, empty);

        assert.strictEqual(options.exit.mock.callCount(), 0);
      });

      describe("when value is invalid", () => {
        it("should reject and not write to output file", async () => {
          const options = createMockOptions();

          await assert.rejects(
            parse(
              [
                ...mockArgv,
                "--encoding",
                "bad",
                "./fixtures/unescaped/latin1.txt",
                outputFile,
              ],
              options,
            ),
            new Error("Invalid encoding bad"),
          );

          assert.strictEqual(await fileExists(outputFile), false);

          assert.deepEqual(options.stdout.buffer, empty);
          assert.deepEqual(options.stderr.buffer, empty);

          assert.strictEqual(options.exit.mock.callCount(), 0);
        });
      });
    });

    describe("when --reverse option is included in argv", () => {
      it("should convert all Unicode escapes read from input file and write to output file", async () => {
        const options = createMockOptions();

        await parse(
          [
            ...mockArgv,
            "--reverse",
            "./fixtures/escaped/latin1-from-utf8.txt",
            outputFile,
          ],
          options,
        );

        const expected = unescapedUtf8;
        const actual = await readFile(outputFile);

        assert.deepEqual(actual, expected);

        assert.deepEqual(options.stdout.buffer, empty);
        assert.deepEqual(options.stderr.buffer, empty);

        assert.strictEqual(options.exit.mock.callCount(), 0);
      });
    });

    describe("when both --encoding and --reverse options are included in argv", () => {
      it("should convert all Unicode escapes read from input file and write to output file", async () => {
        const options = createMockOptions();

        await parse(
          [
            ...mockArgv,
            "--encoding",
            "latin1",
            "--reverse",
            "./fixtures/escaped/latin1-from-latin1.txt",
            outputFile,
          ],
          options,
        );

        const expected = unescapedLatin1;
        const actual = await readFile(outputFile);

        assert.deepEqual(actual, expected);

        assert.deepEqual(options.stdout.buffer, empty);
        assert.deepEqual(options.stderr.buffer, empty);

        assert.strictEqual(options.exit.mock.callCount(), 0);
      });
    });
  });

  describe("when --help option is included in argv", () => {
    it("should print help information and exit", async () => {
      const options = createMockOptions();

      await assert.rejects(
        parse([...mockArgv, "--help"], options),
        createMockExitError(),
      );

      assert.strictEqual(options.stdout.buffer.toString(), helpOutput);
      assert.deepEqual(options.stderr.buffer, empty);

      assert.strictEqual(options.exit.mock.callCount(), 1);
      assert.deepStrictEqual(options.exit.mock.calls[0]?.arguments, [0]);
    });
  });

  describe("when --version option is included in argv", () => {
    it("should print version and exit", async () => {
      const options = createMockOptions();

      await assert.rejects(
        parse([...mockArgv, "--version"], options),
        createMockExitError(),
      );

      assert.strictEqual(options.stdout.buffer.toString(), versionOutput);
      assert.deepEqual(options.stderr.buffer, empty);

      assert.strictEqual(options.exit.mock.callCount(), 1);
      assert.deepStrictEqual(options.exit.mock.calls[0]?.arguments, [0]);
    });
  });
});
