import fs from "fs"
import { ObjectUtil } from "../util/ObjectUtil.js"
import { FileUtil } from "./FileUtil.js"

/**
 * Language info about a file.
 */
export type FileContentsLang = {
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
export class FileContents {
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
    public lastModified: Date,
    /**
     * Language info about the file.
     */
    readonly lang: FileContentsLang
  ) {
  }

  get contents(): string {
    return this._contents
  }

  set contents(value: string) {
    this._contents = value
  }

  /**
   * Read a file to produce a FileContents, or fail if the file doesn't exist.
   *
   * @param fileName
   * @param declaredEncoding The encoding for enforce, if any (if you know the guess will be wrong for instance).
   */
  static read(fileName: string, declaredEncoding?: BufferEncoding): FileContents {
    const fileStats = fs.statSync(fileName)
    const {encoding, contents} = FileContents.getContents(fileName, declaredEncoding)
    const langInfo = FileContents.getLang(fileName)
    return new FileContents(fileName, encoding, contents, fileStats.mtime, langInfo)
  }

  /**
   * Read a file or instantiate a brand new FileContents if it doesn't exist.
   *
   * @param fileName
   * @param declaredEncoding The encoding for enforce, if any (if you know the guess will be wrong for instance).
   */
  static readOrNew(fileName: string, declaredEncoding?: BufferEncoding): FileContents {
    try {
      return FileContents.read(fileName, declaredEncoding)
    } catch (e) {
      if ((e as any).code === "ENOENT") {
        const lang = FileContents.getLang(fileName)
        return new FileContents(fileName, "utf8", "", new Date(), lang)
      } else {
        throw e
      }
    }
  }

  /**
   * Guess a file language and its language file variants in the same directory.
   *
   * @param filePath The path of the file to guess language for.
   */
  static getLang(filePath: string): FileContentsLang {
    const exec = FileContents.filePathRegex.exec(filePath)
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
          const fileExec = FileContents.fileRegex.exec(f)
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
   * @param fileName
   * @param declaredEncoding The encoding for enforce, if any (if you know the guess will be wrong for instance).
   */
  static getContents(fileName: string, declaredEncoding?: BufferEncoding): {
    encoding: BufferEncoding;
    contents: string
  } {
    let detectedEncoding
    if (!declaredEncoding) {
      detectedEncoding = FileUtil.detectEncoding(fileName)
    }
    const encoding: BufferEncoding = declaredEncoding || detectedEncoding || "utf-8"
    const contents = fs.readFileSync(fileName, {encoding})
    return {encoding, contents}
  }

  async write(): Promise<void> {
    return FileUtil.writeFile(this.name, this.contents, this.encoding)
  }
}
