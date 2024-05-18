import { DirectoryStep } from "./DirectoryStep"
import { SsgContextImpl } from "../SsgContextImpl"
import { SsgContext } from "../SsgContext"
import { describe, expect, test } from "@javarome/testscript"
import { SsgFile } from "../util"

describe("DirectoryStep", () => {

  test("processes subdirs", async () => {
    const config = {outDir: "out"}
    const name = "test directory step"
    const step = new class extends DirectoryStep {
      protected async processDirs(_context: SsgContext, _dirNames: string[], outputFile: SsgFile): Promise<void> {
        return outputFile.write()
      }
    }(["src/"], [], "test/test.html", config, name)
    expect(step.name).toBe(name)
    const context = new SsgContextImpl("fr")
    const result = await step.execute(context)
    expect(result).toEqual({directoryCount: 1})
  })
})
