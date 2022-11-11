import fs from "fs"
import {detectEncoding, getCharSet, getContentType, writeFile} from "./FileUtil"
import {SsgContext} from "../../SsgContext"
import {JSDOM} from "jsdom"

export class SsgFile {

  constructor(
    public name: string, readonly encoding: BufferEncoding, protected _contents: string, readonly lastModified: Date,
    readonly lang: string | string[]
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
    const lang = SsgFile.getFileLang(context, fileName)
    return new SsgFile(fileName, encoding, contents, fileStats.mtime, lang)
  }

  static readOrNew(context: SsgContext, fileName: string, declaredEncoding?: BufferEncoding): SsgFile {
    try {
      return SsgFile.read(context, fileName, declaredEncoding)
    } catch (e) {
      if ((e as any).code === "ENOENT") {
        return new SsgFile(fileName, "utf8", "", new Date(), context.locales)
      } else {
        throw e
      }
    }
  }

  static getFileLang(context: SsgContext, filePath: string): string | string[] {
    let lang = context.locales
    const lastDot = filePath.lastIndexOf(".")
    let lastSlash = filePath.lastIndexOf("/")
    if (lastSlash < 0 || lastSlash < lastDot) {
      lastSlash = lastSlash < 0 ? 0 : lastSlash
      const fileName = filePath.substring(lastSlash, lastDot)
      const variantPos = fileName.lastIndexOf("_")
      if (variantPos > 0) {
        lang = [fileName.substring(variantPos + 1)]
      }
    }
    return lang
  }

  static getContents(context: SsgContext, fileName: string,
                     declaredEncoding?: BufferEncoding): { encoding: BufferEncoding, contents: string } {
    const initialContents = fs.readFileSync(fileName, {encoding: "utf-8"})
    let detectedEncoding
    if (!declaredEncoding) {
      if (fileName.endsWith(".html")) {
        const dom = new JSDOM(initialContents)
        const html = dom.window.document.documentElement
        declaredEncoding = getCharSet(html) || getContentType(html)
      }
      detectedEncoding = detectEncoding(fileName)
    }
    const encoding: BufferEncoding = declaredEncoding || detectedEncoding || "utf-8"
    const contents = fs.readFileSync(fileName, {encoding})
    return {encoding, contents}
  }

  async write(): Promise<void> {
    return writeFile(this.name, this.contents, this.encoding)
  }
}
