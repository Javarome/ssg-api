import { SsgContext } from "./SsgContext.js"

export interface SsgConfig<C extends SsgContext = SsgContext> {
  /**
   * @param context
   * @return the file where to output.
   */
  getOutputPath(context: C): string
}
