import {SsgFile} from "./util/file/SsgFile"
import {BuiltInVars, SsgContext, VarProp} from "./SsgContext"
import {WithPropsOf} from "./util/WithPropsOf"
import {ObjectUtil} from "./util/ObjectUtil"

type AllVars<V> = V & BuiltInVars

export class SsgContextImpl<V = any> implements SsgContext<V> {

  readonly log = process.env.LOG_LEVEL === "none" ? () => {
  } : console.log

  readonly debug = process.env.LOG_LEVEL === "debug" ? console.debug : () => {
  }

  readonly warn = process.env.LOG_LEVEL === "warn" ? console.warn : () => {
  }

  readonly error = process.env.LOG_LEVEL === "error" ? console.error : () => {
  }

  protected vars: WithPropsOf<AllVars<V>>

  constructor(readonly locale: string, vars: WithPropsOf<V>, currentFile: SsgFile | undefined = undefined) {
    this._inputFile = this._outputFile = currentFile
    const builtInVars = {...currentFile}
    this.vars = {...builtInVars, ...vars}
  }

  protected _inputFile: SsgFile | undefined

  get inputFile(): SsgFile {
    return ObjectUtil.asSet(this._inputFile, "Should have a inputFile")
  }

  set inputFile(value: SsgFile) {
    this._inputFile = value
    if (!this._outputFile) {
      this._outputFile = this._inputFile
    }
  }

  protected _outputFile: SsgFile | undefined

  get outputFile(): SsgFile {
    return ObjectUtil.asSet(this._outputFile, "Should have a outputFile")
  }

  set outputFile(value: SsgFile) {
    this._outputFile = value
  }

  getVar(varName: VarProp<V>): string | undefined {
    if (this._inputFile?.hasOwnProperty(varName)) {
      const value = this.inputFile[varName as keyof SsgFile]
      return value?.toString()
    } else {
      return this.vars[varName]
    }
  }

  setVar(varName: VarProp<V>, value: any): void {
    if (SsgFile.prototype.hasOwnProperty.call(SsgFile.prototype, varName)) {
      (this.inputFile as any)[varName] = value
    } else {
      this.vars[varName] = value
    }
  }

  clone(): SsgContext<V> {
    return new SsgContextImpl(this.locale, this.vars, this._inputFile)
  }
}
