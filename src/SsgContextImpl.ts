import {SsgFile} from "./util/file/SsgFile"
import {ContextVarName, SsgContext} from "./SsgContext"

export class SsgContextImpl implements SsgContext {

  readonly log = process.env.LOG_LEVEL === "none" ? () => {
  } : console.log

  readonly debug = process.env.LOG_LEVEL === "debug" ? console.debug : () => {
  }

  readonly warn = process.env.LOG_LEVEL === "warn" ? console.warn : () => {
  }

  readonly error = process.env.LOG_LEVEL === "error" ? console.error : () => {
  }

  protected vars = new Map<string, string>()

  constructor(readonly locales: string | string[], currentFile: SsgFile | undefined = undefined) {
    this._inputFile = this._outputFile = currentFile
  }

  protected _inputFile: SsgFile | undefined

  get inputFile(): SsgFile {
    if (!this._inputFile) {
      throw Error("Should have a inputFile")
    }
    return this._inputFile
  }

  set inputFile(value: SsgFile) {
    this._inputFile = value
    if (!this._outputFile) {
      this._outputFile = this._inputFile
    }
  }

  protected _outputFile: SsgFile | undefined

  get outputFile(): SsgFile {
    if (!this._outputFile) {
      throw Error("Should have a outputFile")
    }
    return this._outputFile
  }

  set outputFile(value: SsgFile) {
    this._outputFile = value
  }

  getVar(varName: ContextVarName): string | undefined {
    if (this.inputFile.hasOwnProperty(varName)) {
      const value = this.inputFile[varName as keyof SsgFile]
      return value?.toString()
    } else {
      return this.vars.get(varName)
    }
  }

  setVar(varName: ContextVarName, value: any): void {
    if (SsgFile.prototype.hasOwnProperty.call(SsgFile.prototype, varName)) {
      (this.inputFile as any)[varName] = value
    } else {
      this.vars.set(varName, value)
    }
  }

  clone(): SsgContext {
    return new SsgContextImpl(this.locales, this._inputFile)
  }
}
