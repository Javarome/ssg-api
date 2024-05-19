import { Ssg } from "./Ssg"
import { SsgContextImpl } from "./SsgContextImpl"
import { SsgStep } from "./step"
import { SsgContext } from "./SsgContext"
import { describe, expect, test } from "@javarome/testscript"
import { SsgConfig } from "./SsgConfig"
import path from "path"

describe("Ssg", function () {

  test("start", async () => {
    const config: SsgConfig = {
      getOutputPath(context: SsgContext): string {
        return path.join("out", context.name)
      }
    }
    const step1 = new class implements SsgStep {
      async execute(context: SsgContext): Promise<any> {
        context.log("Doing step 1")
        return true
      }
    }()
    const step2 = new class implements SsgStep {
      readonly name = "Second step"

      async execute(context: SsgContext): Promise<any> {
        context.log("Doing step 2")
        return {step2Done: true}
      }
    }()
    const ssg = new Ssg(config)
      .add(step1)
      .add(step2)
    const context = new SsgContextImpl("fr")
    const result = await ssg.start(context)
    expect(result).toEqual({"#1": true, "Second step": {step2Done: true}})
  })
})
