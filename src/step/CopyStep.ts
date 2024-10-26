import * as process from "process"
import { SsgStep } from "./SsgStep.js"
import { SsgContextImpl } from "../SsgContextImpl.js"
import { FileCopyConfig } from "./FileCopyConfig"
import { copy, FileContents } from "@javarome/fileutil"
import path from "path"

export type CopyStepResult = {
  files: string[]
}

/**
 * Perform copies to out directory.
 */
export class CopyStep<C extends SsgContextImpl = SsgContextImpl> implements SsgStep<C, CopyStepResult> {

  readonly name = "copy"

  constructor(protected config: FileCopyConfig) {
  }

  async execute(context: C): Promise<CopyStepResult> {
    try {
      context.file = new FileContents("toCopy", "utf-8", "", new Date, "en")
      const outDir = path.dirname(this.config.getOutputPath(context))
      const copiedFiles = await copy(outDir, this.config.sourcePatterns, this.config.options)
      const cwd = process.cwd()
      const files = copiedFiles.map(file => file.startsWith(cwd) ? file.substring(cwd.length + 1) : file)
      return {files}
    } catch (e) {
      throw Error(`Could not copy ${this.config.sourcePatterns} because of ${e}`)
    }
  }
}
