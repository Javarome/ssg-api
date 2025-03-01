import { SsgContext } from "./SsgContext.js"

export abstract class FileWriteConfig<C extends SsgContext = SsgContext> {
  /**
   * @param context
   * @return the file where to output.
   */
  abstract getOutputPath(context: C): string
}
