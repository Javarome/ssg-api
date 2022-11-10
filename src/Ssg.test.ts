import {Ssg, SsgConfig} from "./Ssg"
import {SsgContextImpl} from "./SsgContextImpl"
import {SsgStep, SsgStepResult} from "./step"
import {SsgContext} from "./SsgContext"

describe("Ssg", function () {

  test("start", async () => {
    const config = {outDir: "out/"}
    const step1 = new class implements SsgStep {
      async execute(context: SsgContext, config: SsgConfig): Promise<SsgStepResult> {
        context.log("Doing step 1")
        return {step1Ok: true}
      }
    }()
    const step2 = new class implements SsgStep {
      async execute(context: SsgContext, config: SsgConfig): Promise<SsgStepResult> {
        context.log("Doing step 2")
        return {step2Done: true}
      }
    }()
    const ssg = new Ssg(config)
      .add(step1)
      .add(step2)
    const context = new SsgContextImpl("fr")
    try {
      const result = ssg.start(context)
      context.log("Completed", result)
    } catch (e) {
      context.error(e)
    }
  })
})
