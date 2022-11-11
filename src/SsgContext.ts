import {SsgFile} from "./util/file/SsgFile"

export type BuiltInVars = SsgFile | undefined

export type VarProp<V> = keyof BuiltInVars | keyof V

export interface SsgContext<V = any> {
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

  log: { (message?: any, ...optionalParams: any[]): void; (...data: any[]): void }
  debug: { (message?: any, ...optionalParams: any[]): void; (...data: any[]): void }
  warn: { (message?: any, ...optionalParams: any[]): void; (...data: any[]): void }
  error: { (message?: any, ...optionalParams: any[]): void; (...data: any[]): void }

  getVar(varName: VarProp<V>): string | undefined

  setVar(varName: VarProp<V>, value: any): void

  clone(): SsgContext<V>
}

