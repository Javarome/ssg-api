import { SsgContext } from "../../SsgContext.js"
import { ReplaceCommand } from "./replace/index.js"
import { SsgConfig } from "../../SsgConfig.js"

export interface ContentStepConfig<C extends SsgContext = SsgContext> extends SsgConfig {
  /**
   * The glob roots of contents to process.
   */
  roots: string[],

  /**
   * The replacements to process on contents.
   */
  replacements: ReplaceCommand<C>[],
}
