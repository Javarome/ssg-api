import { CopyStep, CopyStepConfig } from "./CopyStep"
import { SsgContextImpl } from "../SsgContextImpl"
import { describe, expect, test } from "@javarome/testscript"
import path from "path"
import { SsgContext } from "../SsgContext"

describe("CopyStep", () => {

  test("copy", async () => {
    const outDir = "out"
    const config: CopyStepConfig = {
      copies: ["**/test.html", "**/*.bpmn"],
      getOutputPath(context: SsgContext): string {
        return path.join(outDir, context.name)
      },
      options: {ignore: "out/**"}
    }
    const step = new CopyStep(config)
    const context = new SsgContextImpl("fr")
    const result = await step.execute(context)
    expect(result).toEqual(
      {files: [outDir + "/test/test.html", outDir + "/test/dir/example.bpmn"]})
  })
})
