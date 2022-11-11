import {SsgContext} from "../SsgContext"

export interface SsgStep<R = any> {

  readonly name?: string

  /**
   * Execute the step.
   *
   * @param context
   */
  execute(context: SsgContext): Promise<R>
}
