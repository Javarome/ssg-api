import { Logger } from "./Logger.js"
import { FileContents } from "@javarome/fileutil"

export interface SsgContext<V = any> extends Logger {
  /**
   * Context identifier. Used in the logs.
   *
   * @see push() to create a sub-context with a different name.
   */
  name: string

  /**
   * Logger.
   */
  logger: Logger

  /**
   * The locale to use to format output (dates, messages, etc.).
   */
  readonly locale: string

  /**
   * The file that is being processed (a template for instance).
   */
  file: FileContents

  getVar(varName: string): string | undefined

  setVar(varName: string, value: any): void

  clone(): SsgContext<V>

  /**
   * Defines a new sub-context.
   *
   * @param name The name of the new sub-context.
   */
  push(name: string): SsgContext

  /**
   * Restores parent context.
   */
  pop(): SsgContext

  /**
   * Reads a file and assign it to the context's `file`.
   *
   * @abstract
   * @param filePath
   */
  read(filePath: string): FileContents

  /**
   * Reads a file and assign it to the context's `file`.
   *
   * @abstract
   * @param filePath
   * @param encoding
   */
  newOutput(filePath: string, encoding?: BufferEncoding): FileContents
}
