import * as fs from "fs"
import {promises as fsAsync} from "fs"
import detectCharacterEncoding from "detect-character-encoding"
import path from "path"
import {readdir} from "fs/promises"
import cpy from "cpy"

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
      guessedEncoding = detectCharacterEncoding(fileBuffer)
    } catch (e) {
      if ((e as Error).message !== "Failed to detect charset.") {
        throw e
      }
    }
    if (guessedEncoding) {
      return this.toBufferEncoding(guessedEncoding.encoding)
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

  static ensureDirectoryExistence(filePath: string) {
    const dirname = path.dirname(filePath)
    if (fs.existsSync(dirname)) {
      return true
    }
    this.ensureDirectoryExistence(dirname)
    fs.mkdirSync(dirname)
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

  static async ssgCopy(to: string, ...from: string[]): Promise<string[]> {
    return cpy(from, to)
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
