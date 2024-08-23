import { SsgStep } from "./SsgStep.js"
import * as process from "process"
import { GlobOptionsWithFileTypesUnset } from "glob"
import { SsgConfig } from "../SsgConfig.js"
import { FileUtil } from "../util"
import { SsgContextImpl } from "../SsgContextImpl"

export interface CopyStepConfig extends SsgConfig {
  readonly sourcePatterns: string[]
  readonly options?: GlobOptionsWithFileTypesUnset
}

export type CopyStepResult = {
  files: string[]
}

/**
 * Perform copies to out directory.
 */
export class CopyStep<C extends SsgContextImpl = SsgContextImpl> implements SsgStep<C, CopyStepResult> {

  readonly name = "copy"

  constructor(protected config: CopyStepConfig) {
  }

  async execute(context: C): Promise<CopyStepResult> {
    try {
      const copiedFiles = await FileUtil.copy(context, this.config)
      const cwd = process.cwd()
      const files = copiedFiles.map(file => file.startsWith(cwd) ? file.substring(cwd.length + 1) : file)
      return {files}
    } catch (e) {
      throw Error(`Could not copy ${this.config.sourcePatterns} because of ${e}`)
    }
  }
}
