import {Ssg, SsgConfig} from "./Ssg"
import {SsgContextImpl} from "./SsgContextImpl"
import {SsgStep, SsgStepResult} from "./step"
import {SsgContext} from "./SsgContext"

describe("Ssg", function () {

  test("start", async () => {
    const config = {outDir: "out/"}
    const ssg = new Ssg(config)
    const context = new SsgContextImpl("fr")
    const step1 = new class implements SsgStep {
      async execute(context: SsgContext, config: SsgConfig): Promise<SsgStepResult> {
        console.log("Doing step 1")
        return {step1Ok: true}
      }
    }()
    const step2 = new class implements SsgStep {
      async execute(context: SsgContext, config: SsgConfig): Promise<SsgStepResult> {
        console.log("Doing step 2")
        return {step2Done: true}
      }
    }()
    try {
      const result = await ssg
        .add(step1)
        .add(step2)
        .start(context)
      console.log("Completed", result)
    } catch (e) {
      console.error(e)
    }
  })
})
