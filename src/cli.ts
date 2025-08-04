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

import { readFile, writeFile } from "node:fs/promises";
import { EOL } from "node:os";
import { resolve as resolvePath } from "node:path";
import { Command, type OptionValues } from "commander";
import { native2ascii } from "./native2ascii.js";

/**
 * Contains the character encodings to be used when reading input and writing output.
 */
interface Encodings {
  /**
   * The character encoding to be used when reading input.
   */
  input: NodeJS.BufferEncoding;
  /**
   * The character encoding to be used when writing output.
   */
  output: NodeJS.BufferEncoding;
}

/**
 * Contains the read input and where it was read from.
 */
interface Input {
  /**
   * The content that was read, which may be empty.
   */
  content: string;
  /**
   * Where the input was read from.
   */
  source: "file" | "stdin";
}

/**
 * The options that can be provided to {@link parse}.
 */
export interface ParseOptions {
  /**
   * The current working directory to be used.
   *
   * If not specified, `process.cwd()` will be used.
   */
  cwd?: string;
  /**
   * The end-of-line character to be used.
   *
   * If not specified, `os.EOL` will be used.
   */
  eol?: string;
  /**
   * The function used to exit the current process.
   *
   * If not specified, `process.exit` will be used.
   */
  exit?: (code: number) => never;
  /**
   * The stream to which standard errors may be written.
   *
   * If not specified, `process.stderr` will be used.
   */
  stderr?: NodeJS.WritableStream;
  /**
   * The stream from which standard input may be read.
   *
   * If not specified, `process.stdin` will be used.
   */
  stdin?: NodeJS.ReadableStream;
  /**
   * The stream to which standard output may be written.
   *
   * If not specified, `process.stdout` will be used.
   */
  stdout?: NodeJS.WritableStream;
  /**
   * The version of `node-native2ascii` being used.
   */
  version: string;
}

/**
 * Determines the character encodings to be used to read input and write output based on the parsed command `options`
 * provided.
 *
 * @param options The parsed command options to be used.
 * @return The character encodings to be used.
 * @throws Error If `options.encoding` is specified but is not a valid character encoding.
 */
const getEncodings = (options: OptionValues): Encodings => {
  const { encoding, reverse } = options;

  if (encoding && !Buffer.isEncoding(encoding)) {
    throw new Error(`Invalid encoding ${encoding}`);
  }

  const asciiEncoding = "latin1";
  const nativeEncoding = encoding || "utf8";

  return {
    input: reverse ? asciiEncoding : nativeEncoding,
    output: reverse ? nativeEncoding : asciiEncoding,
  };
};

/**
 * Returns the most detailed string representation of the specified `error` with the following preference:
 *
 * - `stack`
 * - `message`
 * - `toString()`
 *
 * @param error The error for which a message should be returned.
 * @return A string representation of `error`.
 */
const getErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error) {
    if ("stack" in error && typeof error.stack === "string" && error.stack) {
      return `${error.stack}`;
    }
    if (
      "message" in error &&
      typeof error.message === "string" &&
      error.message
    ) {
      return `${error.message}`;
    }
  }
  return `${error}`;
};

/**
 * Reads the input to be converted as a string using the character `encoding` provided.
 *
 * If `file` is specified, its contents are read as the input. Otherwise, the input is read directly from STDIN.
 *
 * @param file The input file to be read, where applicable.
 * @param encoding The character encoding to be used to read the input.
 * @param options The options to be used.
 * @return The input to be converted.
 */
const readInput = async (
  file: string | undefined,
  encoding: NodeJS.BufferEncoding,
  options: Required<ParseOptions>,
): Promise<Input> => {
  if (file) {
    return {
      content: await readFile(resolvePath(options.cwd, file), encoding),
      source: "file",
    };
  }

  const buffer = await readStdin(options);
  return {
    content: buffer.toString(encoding),
    source: "stdin",
  };
};

/**
 * Reads the input from STDIN.
 *
 * @param options The options to be used.
 * @return The input read from STDIN.
 */
export const readStdin = async (
  options: Required<ParseOptions>,
): Promise<Buffer> => {
  const { stdin } = options;
  if ("isTTY" in stdin && stdin.isTTY === true) {
    return Buffer.alloc(0);
  }

  let length = 0;
  const result: Buffer[] = [];

  for await (const chunk of stdin) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);

    result.push(buffer);
    length += chunk.length;
  }

  return Buffer.concat(result, length);
};

/**
 * Resolves the specified `options`, using default values where needed.
 *
 * The specified `options` value is not modified, and instead a copy is returned with default values used, where
 * appropriate.
 *
 * @param options The options to be resolved.
 * @return The resolved options.
 */
const resolveOptions = (options: ParseOptions): Required<ParseOptions> =>
  Object.assign(
    {
      cwd: process.cwd(),
      eol: EOL,
      exit: process.exit,
      stderr: process.stderr,
      stdin: process.stdin,
      stdout: process.stdout,
    },
    options,
  );

/**
 * Writes the specified `output` as a string using the character `encoding` provided.
 *
 * If `file` is specified, `output` will be written to it. Otherwise, `output` is written directly to STDOUT.
 *
 * @param output The output to be written.
 * @param file The input file to be read, where applicable.
 * @param encoding The character encoding to be used to write `output`.
 * @param options The options to be used.
 */
const writeOutput = async (
  output: string,
  file: string | undefined,
  encoding: NodeJS.BufferEncoding,
  options: Required<ParseOptions>,
): Promise<void> => {
  if (file) {
    await writeFile(resolvePath(options.cwd, file), output, encoding);
  } else {
    await writeStdout(output, encoding, options);
  }
};

/**
 * Writes the specified `output` to STDOUT using the character `encoding` provided.
 *
 * @param output The output to be written to STDOUT.
 * @param encoding The character encoding to be used to write `output`.
 * @param options The options to be used.
 */
const writeStdout = (
  output: string,
  encoding: NodeJS.BufferEncoding,
  options: Required<ParseOptions>,
): Promise<void> => {
  const { stdout } = options;

  return new Promise((resolve, reject) => {
    stdout.on("error", reject);
    stdout.on("finish", resolve);
    stdout.end(output, encoding);
  });
};

/**
 * Writes a message to STDERR indicating that it has failed and then will exit the current process.
 *
 * @param error The error responsible for the failure.
 * @param options The options to be used.
 */
export const fail = (error: unknown, options: ParseOptions): void => {
  const { eol, exit, stderr } = resolveOptions(options);
  const message = getErrorMessage(error);

  stderr.write(`native2ascii failed: ${message}${eol}`);

  exit(1);
};

/**
 * Parses the command line arguments and performs the necessary conversion.
 *
 * The primary conversion is to convert a file that is encoded to any character encoding that is supported by Node.js
 * (which can be controlled via the `encoding` command line option) to a file encoded in ASCII, using Unicode escapes
 * ("\uxxxx" notation) for all characters that are not part of the ASCII character set.
 *
 * This can be useful when dealing with `.properties` files and characters that are not in the ISO-8859-1 character set.
 *
 * The `reverse` command line option can be specified to reverse the conversion and instead convert Unicode escapes to
 * their corresponding Unicode characters.
 *
 * If the `output-file` command line argument is not specified, standard output is used for output. Additionally, if the
 * `input-file` command line argument is not specified, standard input is used for input.
 *
 * Additional `options` can be specified for additional control, however, everything other than
 * {@link ParseOptions#version} is primarily intended for testing purposes only.
 *
 * @param argv The command line arguments to be parsed.
 * @param options The options to be used.
 */
export const parse = async (
  argv: string[],
  options: ParseOptions,
): Promise<void> => {
  const resolvedOptions = resolveOptions(options);

  const command = new Command("native2ascii")
    .configureOutput({
      writeErr: (str) => resolvedOptions.stderr.write(str),
      writeOut: (str) => resolvedOptions.stdout.write(str),
    })
    .exitOverride((error) => resolvedOptions.exit(error.exitCode))
    .usage("[options] [input-file] [output-file]")
    .arguments("[input-file] [output-file]")
    .option("-e, --encoding <encoding>", "specify encoding to use", "utf8")
    .option("-r, --reverse", "perform reverse conversion", false)
    .version(resolvedOptions.version)
    .parse(argv);
  const commandOptions = command.opts();

  const { input: inputEncoding, output: outputEncoding } =
    getEncodings(commandOptions);
  const [inputFile, outputFile] = command.args;
  const { content: input, source } = await readInput(
    inputFile,
    inputEncoding,
    resolvedOptions,
  );
  if (!input.length && source === "stdin") {
    command.help();
  }

  const output = native2ascii(input, {
    reverse: commandOptions.reverse,
  });

  await writeOutput(output, outputFile, outputEncoding, resolvedOptions);
};
