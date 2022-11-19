import fs from "fs"
import {SsgContext} from "../../SsgContext"
import {JSDOM} from "jsdom"
import {ObjectUtil} from "../ObjectUtil"
import {FileUtil} from "./FileUtil"

/**
 * Language info about a file.
 */
export type SsgFileLang = {
  /**
   * The detected language for the file ("fr" for instance).
   */
  lang?: string

  /**
   * Other variants detected in the file's directory (["fr", "en"] for instance).
   *
   * A variant is a file with the same name and extension in the same directory, but with a "_language" 2-letter suffix.
   *
   * [] if there are no variants. Will contain "" if there is a variant with no language suffix.
   */
  variants: string[]
}

/**
 * A file as handled by Ssg.
 */
export class SsgFile {
  /**
   * A file path with "directory/prefix[_lang].ext"
   */
  protected static readonly filePathRegex = /(.*\/)?(.*?)(?:_([a-z]{2}))?\.(.*)/

  /**
   * A file name with "prefix[_lang].ext"
   */
  protected static readonly fileRegex = /(.*?)(?:_([a-z]{2}))?\.(.*)/

  constructor(
    /**
     * The name of the file, including path.
     */
    public name: string,
    /**
     * The contents encoding ("utf8", etc.)
     */
    readonly encoding: BufferEncoding,
    /**
     * The file contents as text.
     */
    protected _contents: string,
    /**
     * The date of last modification.
     */
    readonly lastModified: Date,
    /**
     * Language info about the file.
     */
    readonly lang: SsgFileLang
  ) {
  }

  get contents(): string {
    return this._contents
  }

  set contents(value: string) {
    this._contents = value
  }

  /**
   * Read a file to produce a SsgFile, or fail if the file doesn't exist.
   *
   * @param context
   * @param fileName
   * @param declaredEncoding The encoding for enforce, if any (if you know the guess will be wrong for instance).
   */
  static read(context: SsgContext, fileName: string, declaredEncoding?: BufferEncoding): SsgFile {
    const fileStats = fs.statSync(fileName)
    const {encoding, contents} = SsgFile.getContents(context, fileName, declaredEncoding)
    const langInfo = SsgFile.getLang(context, fileName)
    return new SsgFile(fileName, encoding, contents, fileStats.mtime, langInfo)
  }

  /**
   * Read a file or instantiate a brand new SsgFile if it doesn't exist.
   *
   * @param context
   * @param fileName
   * @param declaredEncoding The encoding for enforce, if any (if you know the guess will be wrong for instance).
   */
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

  /**
   * Guess a file language and its language file variants in the same directory.
   *
   * @param context
   * @param filePath The path of the file to guess language for.
   */
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
        .filter(f => f.startsWith(fileName) && f.endsWith(ext)) // Only with same filename prefix and same ext
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

  /**
   * Get the text contents of a file, and how it is encoded.
   *
   * @param context
   * @param fileName
   * @param declaredEncoding The encoding for enforce, if any (if you know the guess will be wrong for instance).
   */
  static getContents(context: SsgContext, fileName: string,
                     declaredEncoding?: BufferEncoding): { encoding: BufferEncoding, contents: string } {
    const initialContents = fs.readFileSync(fileName, {encoding: "utf-8"})
    let detectedEncoding
    if (!declaredEncoding) {
      if (fileName.endsWith(".html")) {
        declaredEncoding = SsgFile.getHtmlDeclaredEncoding(initialContents)
      }
      detectedEncoding = FileUtil.detectEncoding(fileName)
    }
    const encoding: BufferEncoding = declaredEncoding || detectedEncoding || "utf-8"
    const contents = fs.readFileSync(fileName, {encoding})
    return {encoding, contents}
  }

  /**
   * Guess file declared encoding from file + HTML info if any.
   *
   * @param contents
   */
  static getHtmlDeclaredEncoding(contents: string): BufferEncoding | undefined {
    const dom = new JSDOM(contents)
    const html = dom.window.document.documentElement
    return FileUtil.getCharSet(html) || FileUtil.getContentType(html)
  }

  async write(): Promise<void> {
    return FileUtil.writeFile(this.name, this.contents, this.encoding)
  }
}
