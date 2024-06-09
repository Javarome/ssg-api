import * as fs from "fs"
import { promises as fsAsync } from "fs"
import { detectEncoding as _detectEncoding } from "char-encoding-detector"
import path from "path"
import { readdir } from "fs/promises"
import { promise as glob } from "glob-promise"
import { IOptions } from "glob"
import { Dirent } from "node:fs"

/**
 * File utility functions
 */
export class FileUtil {
  /**
   * Converts encoding names to Node's buffer encoding names.
   *
   * @param encoding The encoding name ("iso-8859-1", "windows-1252", etc.)
   * @return The matching BufferEncoding, or undefined if not supported.
   */
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

  /**
   * Detect the encoding of some file contents.
   *
   * @param fileName The name of the file to read.
   */
  static detectEncoding(fileName: string): BufferEncoding | undefined {
    const fileBuffer = fs.readFileSync(fileName)
    return FileUtil.detectContentsEncoding(fileBuffer)
  }

  /**
   * Detect the encoding of some contents.
   *
   * @param buffer The buffer holding the contents.
   */
  static detectContentsEncoding(buffer: Buffer) {
    let guessedEncoding = undefined
    try {
      guessedEncoding = _detectEncoding(buffer)
    } catch (e) {
      if ((e as Error).message !== "Failed to detect charset.") {
        throw e
      }
    }
    if (guessedEncoding) {
      return this.toBufferEncoding(guessedEncoding)
    }
  }

  /**
   * Checks if a directory exists and, if not, creates it.
   *
   * @param filePath The path of the directory that must exist.
   */
  static ensureDirectoryOf(filePath: string): string {
    const dirname = path.dirname(filePath)
    if (!fs.existsSync(dirname)) {
      this.ensureDirectoryOf(dirname) // Recursive to create the whole directories chain.
      fs.mkdirSync(dirname)
    }
    return path.resolve(filePath)
  }

  /**
   * Writes a file. If the file directory doesn't exit, it is created.
   *
   * @param filePath The path of the file to write.
   * @param contents The file contents to write.
   * @param encoding The file contents encoding scheme.
   */
  static async writeFile(filePath: string, contents: string, encoding: BufferEncoding): Promise<void> {
    this.ensureDirectoryOf(filePath)
    return fsAsync.writeFile(filePath, contents, {encoding})
  }

  /**
   * Get a list of subdirectories' names.
   *
   * @param fromDir The name of the root directory to look from.
   */
  static async subDirs(fromDir: string): Promise<Dirent[]> {
    const dirs = await readdir(fromDir, {withFileTypes: true})
    return dirs.filter(dirEntry => dirEntry.isDirectory())
  }

  /**
   * Get a list of subdirectories' names.
   *
   * @param fromDir The name of the root directory to look from.
   */
  static async subDirsNames(fromDir: string): Promise<string[]> {
    const subDirs = await this.subDirs(fromDir)
    return subDirs.map(dirEntry => dirEntry.name)
  }

  static async findDirs(fromDirs: string[], excludedDirs: string[] = []): Promise<string[]> {
    let dirNames: string[] = []
    for (let fromDir of fromDirs) {
      const subDirs = await this.findSubDirs(fromDir, excludedDirs)
      dirNames = dirNames.concat(subDirs)
    }
    return dirNames
  }

  static async findSubDirs(ofDir: string, excludedDirs: string[] = []): Promise<string[]> {
    let subDirs: string[] = []
    if (ofDir.endsWith("/*/")) {
      const baseDir = ofDir.substring(0, ofDir.length - 3)
      if (baseDir.endsWith("/*")) {
        const dirs = (await this.findDirs([baseDir + "/"]))
          .filter(dirName => !excludedDirs.includes(dirName))
        for (const dir of dirs) {
          subDirs = subDirs.concat(await this.findDirs([dir + "/*/"]))
        }
      } else {
        subDirs = (await FileUtil.subDirsNames(baseDir)).map(x => path.join(baseDir, x))
      }
    } else {
      subDirs = [ofDir]
    }
    return subDirs
  }

  /**
   * Copy files to a destination directory.
   *
   * @param toDir the destination directory path.
   * @param sourcePatterns An array of file nmes.
   * @param options
   * @return the list of output files.
   */
  static async copy(toDir: string, sourcePatterns: string[], options?: IOptions): Promise<string[]> {
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
    this.ensureDirectoryOf(to)
    fs.copyFileSync(from, to)
    return to
  }
}
