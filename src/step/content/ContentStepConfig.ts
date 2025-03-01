import { SsgContext } from "../../SsgContext.js"
import { ReplaceCommand } from "./replace/ReplaceCommand.js"
import { FileWriteConfig } from "../../FileWriteConfig.js"

export abstract class ContentStepConfig<C extends SsgContext = SsgContext> extends FileWriteConfig {
  /**
   * The glob roots of contents to process.
   */
  roots: string[] = []

  /**
   * The replacements to process on contents.
   */
  replacements: ReplaceCommand<C>[] = []
}
