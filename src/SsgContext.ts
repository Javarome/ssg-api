import {SsgFile} from "./util/file/SsgFile"

export type ContextVarName = "mail" | keyof SsgFile

export interface SsgContext {

  readonly locales: string | string[]

  inputFile: SsgFile

  outputFile: SsgFile
  log: { (message?: any, ...optionalParams: any[]): void; (...data: any[]): void }
  debug: { (message?: any, ...optionalParams: any[]): void; (...data: any[]): void }
  warn: { (message?: any, ...optionalParams: any[]): void; (...data: any[]): void }
  error: { (message?: any, ...optionalParams: any[]): void; (...data: any[]): void }

  getVar(varName: ContextVarName): string | undefined

  setVar(varName: ContextVarName, value: any): void

  clone(): SsgContext
}

