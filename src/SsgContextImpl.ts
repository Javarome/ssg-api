import { SsgContext } from "./SsgContext.js"
import { ConsoleLogger } from "./ConsoleLogger.js"
import { Logger } from "./Logger.js"
import { HtmlFileContents } from "./file/index.js"
import { ObjectUtil } from "./util/index.js"
import { FileContents, FileContentsLang } from "@javarome/fileutil"

export class SsgContextImpl<V = any> implements SsgContext<V> {

  static readonly CONTEXT_PREFIX = "$context."
  static readonly DEFAULT_NAME = "Ssg"

  readonly log = this.logger.log
  readonly debug = this.logger.debug
  readonly warn = this.logger.warn
  readonly error = this.logger.error

  protected stack: string[] = []

  constructor(private _locale: string, protected vars: Map<string, any> = new Map<string, any>(),
              name = SsgContextImpl.DEFAULT_NAME,
              readonly logger: Logger = new ConsoleLogger(name),
              currentFile: FileContents | undefined = undefined) {
    this._file = currentFile
    this.stack.push(name)
    this.name = name
  }

  get locale(): string {
    return this._file?.lang?.lang ? this._file.lang.lang : this._locale
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

  _file: FileContents | undefined

  get file(): FileContents {
    return ObjectUtil.asSet<FileContents>(this._file, "Should have a file")
  }

  set file(value: FileContents) {
    this._file = value
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
    return new SsgContextImpl(this.locale, this.vars, this.name, this.logger, this._file)
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

  read(filePath: string): FileContents {
    this.debug("Reading", filePath)
    this.file = filePath.endsWith(".html")
      ? HtmlFileContents.read(filePath)
      : FileContents.read(filePath)
    return this.file
  }

  newOutput(filePath: string, encoding: BufferEncoding = this._file?.encoding || "utf-8"): FileContents {
    let outFile: FileContents
    let lang: FileContentsLang
    try {
      lang = FileContents.getLang(filePath)
    } catch (e) {
      if ((e as any).errno !== -2) {
        throw e
      }
      lang = {lang: this.locale, variants: []}
    }
    const creationDate = new Date()
    if (filePath.endsWith(".html")) {
      const fileInfo: FileContents = new FileContents(filePath, encoding, this.file.contents, creationDate, lang)
      outFile = HtmlFileContents.create(fileInfo)
    } else {
      outFile = new FileContents(filePath, encoding, this.file.contents, creationDate, lang)
    }
    this.logger.debug("Created new output file", outFile.name)
    return outFile
  }
}
