import {SsgFile} from "./util"
import {SsgContext} from "./SsgContext"
import {ObjectUtil} from "./util/ObjectUtil"
import {DefaultLogger} from "./DefaultLogger"
import {Logger} from "./Logger"
import path from "path"
import {HtmlSsgFile} from "./util"

export class SsgContextImpl<V = any> implements SsgContext<V> {

  static readonly CONTEXT_PREFIX = "$context."
  static readonly DEFAULT_NAME = "Ssg"

  readonly log = this.logger.log
  readonly debug = this.logger.debug
  readonly warn = this.logger.warn
  readonly error = this.logger.error

  protected stack: string[] = []

  constructor(readonly locale: string, protected vars: Map<string, any> = new Map<string, any>(),
              name = SsgContextImpl.DEFAULT_NAME,
              readonly logger: Logger = new DefaultLogger(name),
              currentFile: SsgFile | undefined = undefined) {
    this._inputFile = this._outputFile = currentFile
    this.stack.push(name)
    this.name = name
  }

  protected _name = SsgContextImpl.DEFAULT_NAME

  get name(): string {
    return this._name
  }

  set name(newName: string) {
    this._name = newName
    const lastLevel = this.stack.length - 1
    if (lastLevel >= 0) {
      this.stack[lastLevel] = newName
    }
    this.logger.name = this.stack.join(":")
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

  getVar(varName: string): string | undefined {
    if (varName.startsWith(SsgContextImpl.CONTEXT_PREFIX)) {
      const contextPath = varName.substring(SsgContextImpl.CONTEXT_PREFIX.length).split(".")
      let obj = this
      for (const path of contextPath) {
        obj = (obj as any)[path]
      }
      return obj.toString()
    } else {
      return this.vars.get(varName)
    }
  }

  setVar(varName: string, value: any): void {
    if (varName.startsWith(SsgContextImpl.CONTEXT_PREFIX)) {
      const contextPath = varName.substring(SsgContextImpl.CONTEXT_PREFIX.length).split(".")
      let obj = this
      for (let i = 0; i < contextPath.length - 1; i++) {
        const path = contextPath[i]
        obj = (obj as any)[path]
      }
      return (obj as any)[contextPath.length - 1] = value
    } else {
      this.vars.set(varName, value)
    }
  }

  clone(): SsgContext<V> {
    return new SsgContextImpl(this.locale, this.vars, this.name, this.logger, this._inputFile)
  }

  push(newName: string): SsgContext {
    this.stack.push(newName)
    this.name = newName
    return this
  }

  pop(): SsgContext {
    ObjectUtil.asSet(this.stack.pop())
    const lastLevel = this.stack.length - 1
    if (lastLevel >= 0) {
      this.name = this.stack[lastLevel]
    }
    return this
  }

  read(fileName: string) {
    this.inputFile = fileName.endsWith(".html")
      ? HtmlSsgFile.read(this, fileName)
      : SsgFile.read(this, fileName)
  }

  readOrNew(fileName: string, outDir: string) {
    const filePath = path.join(outDir, fileName)
    const encoding = this._outputFile?.encoding
    this.outputFile = fileName.endsWith(".html")
      ? HtmlSsgFile.readOrNew(this, filePath, encoding)
      : SsgFile.readOrNew(this, filePath, encoding)
  }
}
