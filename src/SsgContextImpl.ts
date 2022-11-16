import {SsgFile} from "./util/file/SsgFile"
import {BuiltInVars, SsgContext, VarProp} from "./SsgContext"
import {WithPropsOf} from "./util/WithPropsOf"
import {ObjectUtil} from "./util/ObjectUtil"
import {DefaultLogger} from "./DefaultLogger"
import {Logger} from "./Logger"

type AllVars<V> = V & BuiltInVars

export class SsgContextImpl<V = any> implements SsgContext<V> {

  static readonly DEFAULT_NAME = "Ssg"

  readonly log = this.logger.log
  readonly debug = this.logger.debug
  readonly warn = this.logger.warn
  readonly error = this.logger.error

  protected vars: WithPropsOf<AllVars<V>>

  constructor(readonly locale: string, vars: WithPropsOf<V>, name = SsgContextImpl.DEFAULT_NAME,
              readonly logger: Logger = new DefaultLogger(name),
              currentFile: SsgFile | undefined = undefined) {
    this._inputFile = this._outputFile = currentFile
    const builtInVars = {...currentFile}
    this.vars = {...builtInVars, ...vars}
    this.name = name
  }

  protected _name = SsgContextImpl.DEFAULT_NAME

  get name(): string {
    return this._name
  }

  set name(newName: string) {
    this._name = newName
    this.logger.name = this._name
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
    return new SsgContextImpl(this.locale, this.vars, this.name, this.logger, this._inputFile)
  }
}
