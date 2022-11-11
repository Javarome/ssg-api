import {Ssg} from "./Ssg"
import {SsgContextImpl} from "./SsgContextImpl"
import {SsgStep} from "./step"
import {SsgContext} from "./SsgContext"

describe("Ssg", function () {

  test("start", async () => {
    const config = {outDir: "out/"}
    const step1 = new class implements SsgStep {
      async execute(context: SsgContext): Promise<any> {
        context.log("Doing step 1")
        return {step1Ok: true}
      }
    }()
    const step2 = new class implements SsgStep {
      readonly name = "second"

      async execute(context: SsgContext): Promise<any> {
        context.log("Doing step 2")
        return {step2Done: true}
      }
    }()
    const ssg = new Ssg(config)
      .add(step1)
      .add(step2)
    const context = new SsgContextImpl("fr")
    try {
      const result = await ssg.start(context)
      expect(result).toEqual({step1Ok: true, step2Done: true})
    } catch (e) {
      context.error(e)
    }
  })
})
