import {SsgFile} from '../../../util'
import {SsgContext} from "../../../SsgContext"

export interface ReplaceCommand<C extends SsgContext> {
  /**
   * Proceed to the replacement from context.inputFile to context.outputFile
   *
   * @param context
   * @return The output file.
   */
  execute(context: C): Promise<SsgFile>

  /**
   * Called when content step is terminating.
   */
  contentStepEnd(): Promise<void>
}
