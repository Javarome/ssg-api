import { SsgContext } from "../../SsgContext.js"
import { ReplaceCommand } from "./replace/index.js"
import { FileWriteConfig } from "../../FileWriteConfig"

export interface ContentStepConfig<C extends SsgContext = SsgContext> extends FileWriteConfig {
  /**
   * The glob roots of contents to process.
   */
  roots: string[],

  /**
   * The replacements to process on contents.
   */
  replacements: ReplaceCommand<C>[],
}
