import {SsgStep} from "./SsgStep"
import {SsgConfig} from "../Ssg"
import {SsgContext} from "../SsgContext"
import {FileUtil} from "../util"

export type CopyStepResult = {
  filesCount: number
}

/**
 * Perform copies to out directory.
 */
export class CopyStep implements SsgStep<CopyStepResult> {

  readonly name = "copy"

  constructor(protected copies: string[], protected config: SsgConfig) {
  }

  async execute(context: SsgContext): Promise<CopyStepResult> {
    const copies: string[] = this.copies
    const dest = this.config.outDir
    try {
      context.log("Copying to", dest, copies)
      const files = await FileUtil.ssgCopy(dest, ...copies)
      return {
        filesCount: files.length
      }
    } catch (e) {
      throw Error("Could not copy" + copies + " because of " + e)
    }
  }
}
