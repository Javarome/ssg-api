import {SsgFile} from "./util/index.js"
import {Logger} from "./Logger.js"

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
   * The file that has been read (a template for instance).
   */
  inputFile: SsgFile

  /**
   * The file that will be written.
   */
  outputFile: SsgFile

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
   * Reads a file and assign it to the context input.
   *
   * @param fileName
   */
  getInputFrom(fileName: string): SsgFile

/**
 * Reads or create (if not found) a file and assign it to the context output.
 *
 * By default (if the file is not found), output contents are equal to input contents.
 */
 setOutputFrom(filePath: string): SsgFile
}
