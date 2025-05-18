import { SsgContext } from "../../../SsgContext.js"

export interface ReplacerFactory<R> {
  /**
   * Creates a replacer
   */
  create(context: SsgContext): Promise<R>
}
