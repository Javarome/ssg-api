import path from "path"
import { describe, expect, test } from "@javarome/testscript"
import { Ssg } from "./Ssg.js"
import { SsgContextImpl } from "./SsgContextImpl.js"
import { SsgStep } from "./step/index.js"
import { SsgContext } from "./SsgContext.js"
import { FileWriteConfig } from "./FileWriteConfig"

describe("Ssg", function () {

  test("start", async () => {
    const config: FileWriteConfig = {
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
