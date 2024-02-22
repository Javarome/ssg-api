import * as fs from "fs"
import { promises as fsAsync } from "fs"
import { detectEncoding } from "char-encoding-detector"
import path from "path"
import { readdir } from "fs/promises"
import { promise as glob } from "glob-promise"
import { IOptions } from "glob"

export class FileUtil {

  static toBufferEncoding(encoding: string | undefined): BufferEncoding | undefined {
    switch (encoding?.toLowerCase()) {
      case "utf-8":
        return "utf-8"
      case "iso-8859-1":
      case "iso-8859-2":
      case "windows-1252":
      case "windows-1253":
      case "IBM424_ltr":
        return "latin1"
      default:
        return encoding ? encoding as BufferEncoding : undefined
    }
  }

  static detectEncoding(fileName: string): BufferEncoding | undefined {
    const fileBuffer = fs.readFileSync(fileName)
    let guessedEncoding = undefined
    try {
      guessedEncoding = detectEncoding(fileBuffer)
    } catch (e) {
      if ((e as Error).message !== "Failed to detect charset.") {
        throw e
      }
    }
    if (guessedEncoding) {
      return this.toBufferEncoding(guessedEncoding)
    }
  }

  static getCharSet(html: HTMLElement): BufferEncoding | undefined {
    let charSet: BufferEncoding | undefined
    const charsetEl = html.querySelector("html[charset]")
    if (charsetEl) {
      const charSetValue = charsetEl.getAttribute("charset") || undefined
      charSet = this.toBufferEncoding(charSetValue)
    }
    return charSet
  }

  /**
   * Checks if a directory exists and, if not, creates it.
   *
   * @param dir The path of the directory that must exist.
   */
  static ensureDirectoryExistence(dir: string): string {
    const dirname = path.dirname(dir)
    if (!fs.existsSync(dirname)) {
      this.ensureDirectoryExistence(dirname) // Recursive to create the whole directories chain.
      fs.mkdirSync(dirname)
    }
    return path.resolve(dir)
  }

  static async writeFile(fileName: string, contents: string, encoding: BufferEncoding): Promise<void> {
    this.ensureDirectoryExistence(fileName)
    return fsAsync.writeFile(fileName, contents, {encoding})
  }

  static async dirNames(dir: string): Promise<string[]> {
    const dirs = await readdir(dir, {withFileTypes: true})
    return dirs.filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
  }

  /**
   * Copy files to a destination directory.
   *
   * @param toDir the destination directory path.
   * @param sourcePatterns An array of file nmes.
   * @param options
   * @return the list of output files.
   */
  static async ssgCopy(toDir: string, sourcePatterns: string[], options?: IOptions): Promise<string[]> {
    let result: string[] = []
    for (const sourcePattern of sourcePatterns) {
      const sourceFiles = await glob(sourcePattern, options)
      const copied = this.copyFiles(sourceFiles, toDir)
      result = result.concat(copied)
    }
    return result
  }

  static copyFiles(sourceFiles: string[], toDir: string): string[] {
    const result: string[] = []
    for (const sourceFile of sourceFiles) {
      const to = this.copyFile(sourceFile, toDir)
      result.push(to)
    }
    return result
  }

  static copyFile(sourceFile: string, toDir: string): string {
    const from = path.resolve(sourceFile)
    const to = path.join(toDir, sourceFile)
    this.ensureDirectoryExistence(to)
    fs.copyFileSync(from, to)
    return to
  }

  static getContentType(html: HTMLElement): BufferEncoding | undefined {
    let contentType: BufferEncoding | undefined
    const contentTypeEl = html.querySelector("meta[http-equiv='Content-Type']")
    if (contentTypeEl) {
      const content = contentTypeEl.getAttribute("content")
      if (content) {
        const values = content.split(";")
        if (values.length > 0) {
          let value = values[1]
          let key = "charset="
          let charsetPos = value.indexOf(key)
          if (charsetPos >= 0) {
            const charset = value.substring(charsetPos + key.length).toLowerCase().trim()
            contentType = this.toBufferEncoding(charset)
          }
        }
      }
    }
    return contentType
  }
}
