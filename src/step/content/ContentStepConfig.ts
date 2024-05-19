import { SsgContext } from "../../SsgContext"
import { ReplaceCommand } from "./replace"
import { SsgConfig } from "../../SsgConfig"

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
