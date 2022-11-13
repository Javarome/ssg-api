import fs from "fs"
import {detectEncoding, getCharSet, getContentType, writeFile} from "./FileUtil"
import {SsgContext} from "../../SsgContext"
import {JSDOM} from "jsdom"
import {ObjectUtil} from "../ObjectUtil"

export type SsgFileLang = {
  /**
   * The detected language for the file ("fr" for instance).
   */
  lang?: string

  /**
   * Other variants detected in the file's directory (["fr", "en"] for instance)
   *
   * [] if there are no variants. Will contain "" if there is a variant with no language suffix.
   */
  variants: string[]
}

export class SsgFile {

  protected static readonly filePathRegex = /(.*\/)?(.*?)(?:_(.*))?\.(.*)/
  protected static readonly fileRegex = /(.*?)(?:_(.*))?\.(.*)/

  constructor(
    public name: string, readonly encoding: BufferEncoding, protected _contents: string, readonly lastModified: Date,
    readonly lang: SsgFileLang
  ) {
  }

  get contents(): string {
    return this._contents
  }

  set contents(value: string) {
    this._contents = value
  }

  static read(context: SsgContext, fileName: string, declaredEncoding?: BufferEncoding): SsgFile {
    const fileStats = fs.statSync(fileName)
    const {encoding, contents} = SsgFile.getContents(context, fileName, declaredEncoding)
    const lang = SsgFile.getLang(context, fileName)
    return new SsgFile(fileName, encoding, contents, fileStats.mtime, lang)
  }

  static readOrNew(context: SsgContext, fileName: string, declaredEncoding?: BufferEncoding): SsgFile {
    try {
      return SsgFile.read(context, fileName, declaredEncoding)
    } catch (e) {
      if ((e as any).code === "ENOENT") {
        const lang = SsgFile.getLang(context, fileName)
        return new SsgFile(fileName, "utf8", "", new Date(), lang)
      } else {
        throw e
      }
    }
  }

  static getLang(context: SsgContext, filePath: string): SsgFileLang {
    const exec = SsgFile.filePathRegex.exec(filePath)
    let lang: string | undefined
    let variants: string[] = []
    if (exec) {
      const dir = exec[1] ?? "."
      const fileName = exec[2]
      lang = exec[3] || ""
      const ext = exec[4]
      const files = fs.readdirSync(dir)
      const unique = new Set(files
        .filter(f => f.startsWith(fileName) && f.endsWith(ext))
        .map(f => {
          const fileExec = SsgFile.fileRegex.exec(f)
          return fileExec ? fileExec[2] || "" : undefined
        })
        .filter(v => !ObjectUtil.isUndefined(v) && v != lang)
      ) as Set<string>
      variants = Array.from(unique)
    }
    return {lang, variants}
  }

  static getContents(context: SsgContext, fileName: string,
                     declaredEncoding?: BufferEncoding): { encoding: BufferEncoding, contents: string } {
    const initialContents = fs.readFileSync(fileName, {encoding: "utf-8"})
    let detectedEncoding
    if (!declaredEncoding) {
      if (fileName.endsWith(".html")) {
        declaredEncoding = SsgFile.getHtmlDeclaredEncoding(initialContents)
      }
      detectedEncoding = detectEncoding(fileName)
    }
    const encoding: BufferEncoding = declaredEncoding || detectedEncoding || "utf-8"
    const contents = fs.readFileSync(fileName, {encoding})
    return {encoding, contents}
  }

  static getHtmlDeclaredEncoding(initialContents: string): BufferEncoding | undefined {
    const dom = new JSDOM(initialContents)
    const html = dom.window.document.documentElement
    return getCharSet(html) || getContentType(html)
  }

  async write(): Promise<void> {
    return writeFile(this.name, this.contents, this.encoding)
  }
}
