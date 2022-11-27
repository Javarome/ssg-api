import {SsgContext} from "../SsgContext"

export interface SsgStep<C extends SsgContext = SsgContext, R = any> {

  readonly name?: string

  /**
   * Execute the step.
   *
   * @param context
   */
  execute(context: C): Promise<R>
}
