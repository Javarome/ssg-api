import { DirectoryStep } from "./DirectoryStep"
import { SsgContextImpl } from "../SsgContextImpl"
import { SsgContext } from "../SsgContext"
import { describe, expect, test } from "@javarome/testscript"
import { FileContents } from "../util"
import path from "path"

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
