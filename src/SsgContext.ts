import {SsgFile} from "./util/file/SsgFile"
import {Logger} from "./Logger"

export type BuiltInVars = SsgFile | undefined

export type VarProp<V> = keyof BuiltInVars | keyof V

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

  getVar(varName: VarProp<V>): string | undefined

  setVar(varName: VarProp<V>, value: any): void

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
}

