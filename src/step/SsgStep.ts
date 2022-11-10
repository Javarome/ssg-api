import {SsgContext} from "../SsgContext"

export type SsgStepResult = Record<string, any>

export interface SsgStep {

  readonly name?: string

  /**
   * Execute the step.
   *
   * @param context
   */
  execute(context: SsgContext): Promise<SsgStepResult>
}
