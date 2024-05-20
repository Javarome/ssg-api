import { SsgStep } from "./SsgStep.js"
import { SsgContext } from "../SsgContext.js"
import * as process from "process"
import { IOptions } from "glob"
import { SsgConfig } from "../SsgConfig"
import { FileUtil } from "../util"

export interface CopyStepConfig extends SsgConfig {
  readonly sourcePatterns: string[]
  readonly destDir: string
  readonly options?: IOptions
}

export type CopyStepResult = {
  files: string[]
}

/**
 * Perform copies to out directory.
 */
export class CopyStep<C extends SsgContext = SsgContext> implements SsgStep<C, CopyStepResult> {

  readonly name = "copy"

  constructor(protected config: CopyStepConfig) {
  }

  async execute(context: SsgContext): Promise<CopyStepResult> {
    const copies: string[] = this.config.sourcePatterns
    const dest = this.config.destDir
    try {
      context.log("Copying to", dest, copies)
      const copiedFiles = await FileUtil.ssgCopy(dest, copies, this.config.options)
      const cwd = process.cwd()
      const files = copiedFiles.map(file => file.startsWith(cwd) ? file.substring(cwd.length + 1) : file)
      return {files}
    } catch (e) {
      throw Error(`Could not copy ${copies} because of ${e}`)
    }
  }
}
