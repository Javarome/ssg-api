import path from "path"
import { describe, expect, test } from "@javarome/testscript"
import { DirectoryStep } from "./DirectoryStep.js"
import { SsgContextImpl } from "../SsgContextImpl.js"
import { SsgContext } from "../SsgContext.js"
import { FileContents } from "../file/index.js"

describe("DirectoryStep", () => {

  test("processes subdirs", async () => {
    const name = "test directory step"
    const step = new class extends DirectoryStep {
      protected async processDirs(_context: SsgContext, _dirNames: string[], outputFile: FileContents): Promise<void> {
        return outputFile.write()
      }
    }({
      rootDirs: ["src/"], getOutputPath(_context: SsgContext): string {
        return path.join("out", this.templateFileName)
      },
      excludedDirs: [], templateFileName: "test/test.html"

    }, name)
    expect(step.name).toBe(name)
    const context = new SsgContextImpl("fr")
    const result = await step.execute(context)
    expect(result).toEqual({directoryCount: 1})
  })
})
