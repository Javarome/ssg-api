import { SsgContext } from "./SsgContext.js"
import { ObjectUtil } from "./util/ObjectUtil.js"
import { ConsoleLogger } from "./ConsoleLogger"
import { Logger } from "./Logger.js"
import { HtmlSsgFile, SsgFile, SsgFileLang } from "./util"

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
              readonly logger: Logger = new ConsoleLogger(name),
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

  getOutputFrom(filePath: string): SsgFile {
    let outFile: SsgFile
    try {
      outFile = this.readFile(filePath)
      this.logger.debug("Read output file", outFile.name)
    } catch (e) {
      if ((e as any).code === "ENOENT") {
        outFile = this.createOutput(filePath, this._outputFile?.encoding || "utf-8")
      } else {
        throw e
      }
    }
    this.outputFile = outFile
    return this.outputFile
  }

  getInputFrom(filePath: string): SsgFile {
    this.inputFile = this.readFile(filePath)
    return this.inputFile
  }

  createOutput(filePath: string, encoding: BufferEncoding): SsgFile {
    let outFile: SsgFile
    let lang: SsgFileLang
    try {
      lang = SsgFile.getLang(this, filePath)
    } catch (e) {
      if ((e as any).errno !== -2) {
        throw e
      }
      lang = {lang: this.locale, variants: []}
    }
    const creationDate = new Date()
    if (filePath.endsWith(".html")) {
      const fileInfo: SsgFile = new SsgFile(filePath, encoding, this.inputFile.contents, creationDate, lang)
      outFile = HtmlSsgFile.create(fileInfo)
    } else {
      outFile = new SsgFile(filePath, encoding, this.inputFile.contents, creationDate, lang)
    }
    this.logger.debug("Created new output file", outFile.name)
    return outFile
  }

  /**
   * Reads a file in this context.
   *
   * @param fileName The name of the file.
   * @returns {SsgFile}
   * @protected
   */
  protected readFile(fileName: string): SsgFile {
    return fileName.endsWith(".html")
      ? HtmlSsgFile.read(this, fileName)
      : SsgFile.read(this, fileName)
  }
}
