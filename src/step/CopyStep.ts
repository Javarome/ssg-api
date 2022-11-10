import {SsgStep, SsgStepResult} from "./SsgStep"
import {SsgConfig} from "../Ssg"
import {SsgContext} from "../SsgContext"
import {ssgCopy} from "../util/file/FileUtil"

/**
 * Perform copies to out directory.
 */
export class CopyStep implements SsgStep {

  readonly name = "copy"

  constructor(protected copies: string[], protected config: SsgConfig) {
  }

  async execute(context: SsgContext): Promise<SsgStepResult> {
    const copies: string[] = this.copies
    const dest = this.config.outDir
    try {
      context.log("Copying to", dest, copies)
      const files = await ssgCopy(dest, ...copies)
      return {
        filesCount: files.length
      }
    } catch (e) {
      throw Error("Could not copy" + copies + " because of " + e)
    }
  }
}
