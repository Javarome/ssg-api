import { SsgContext } from "./SsgContext.js"
import { SsgConfig } from "./SsgConfig"
import { SsgStep } from "./step"


/**
 * Result of a Ssg.start().
 */
export type SsgResult = {
  [stepName: string]: any
}

/**
 * Static Site Generator
 */
export class Ssg {

  protected steps: SsgStep[] = []

  constructor(protected config: SsgConfig) {
  }

  add(...steps: SsgStep[]) {
    this.steps.push(...steps)
    return this
  }

  async start(context: SsgContext): Promise<SsgResult> {
    const result: SsgResult = {}
    const parentName = context.name
    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i]
      const stepName = step.name ?? `#${i + 1}`
      if (context.name === parentName) {
        context.push(stepName)
      } else {
        context.name = stepName
      }
      context.log(`Executing:`)
      const stepResult = await step.execute(context)
      context.log(`Completed:`, stepResult)
      result[stepName] = stepResult
    }
    context.pop()
    return result
  }
}
