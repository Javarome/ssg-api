import * as fs from "fs"
import { promises as fsAsync } from "fs"
import { detectEncoding as _detectEncoding } from "char-encoding-detector"
import path from "path"
import { readdir } from "fs/promises"
import { Dirent } from "node:fs"
import { SsgContextImpl } from "../SsgContextImpl"
import { CopyStepConfig } from "../step"
import { FileContents } from "./FileContents"
import { glob } from "glob"

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
   * @param context the destination directory path.
   * @param config
   * @return the list of output files.
   */
  static async copy<C extends SsgContextImpl>(context: C, config: CopyStepConfig): Promise<string[]> {
    let result: string[] = []
    for (const sourcePattern of config.sourcePatterns) {
      const sourceFiles = await glob(sourcePattern, config.options)
      const copied = this.copyFiles<C>(context, sourceFiles, config)
      result = result.concat(copied)
    }
    return result
  }

  static copyFiles<C extends SsgContextImpl>(context: C, sourceFiles: string[], config: CopyStepConfig): string[] {
    const result: string[] = []
    for (const sourceFile of sourceFiles) {
      const to = this.copyFile<C>(context, sourceFile, config)
      result.push(to)
    }
    return result
  }

  static copyFile<C extends SsgContextImpl>(context: C, sourceFile: string, config: CopyStepConfig): string {
    context.file = new FileContents(sourceFile, "utf-8", "", new Date(), {variants: []})
    const to = path.resolve(config.getOutputPath(context))
    const from = path.resolve(sourceFile)
    this.ensureDirectoryOf(to)
    fs.copyFileSync(from, to)
    return to
  }
}
