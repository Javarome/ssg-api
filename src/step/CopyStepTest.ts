import { CopyStep, CopyStepConfig } from "./CopyStep.js"
import { SsgContextImpl } from "../SsgContextImpl.js"
import { describe, expect, test } from "@javarome/testscript"
import path from "path"
import { SsgContext } from "../SsgContext.js"

describe("CopyStep", () => {

  test("copy", async () => {
    const destDir = "out/"
    const config: CopyStepConfig = {
      destDir,
      sourcePatterns: ["**/test.html", "**/*.bpmn"],
      getOutputPath(context: SsgContext): string {
        return path.join(destDir, context.name)
      },
      options: {ignore: path.join(destDir, "**")}
    }
    const step = new CopyStep(config)
    const context = new SsgContextImpl("fr")
    const result = await step.execute(context)
    expect(result).toEqual(
      {files: [path.join(destDir, "test/test.html"), path.join(destDir, "test/dir/example.bpmn")]})
  })
})
