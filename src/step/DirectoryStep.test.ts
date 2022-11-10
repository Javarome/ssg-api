import {DirectoryStep} from "./DirectoryStep"
import {SsgContextImpl} from "../SsgContextImpl"
import {SsgContext} from "../SsgContext"
import {writeFileInfo} from "../util"

describe("DirectoryStep", () => {

  test("processes subdirs", async () => {
    const config = {outDir: "out"}
    const name = "test directory step"
    const step = new class extends DirectoryStep {
      protected async processDirs(context: SsgContext, dirames: string[]): Promise<void> {
        return writeFileInfo(context.outputFile)
      }
    }(["src/"], [], "src/test/test.html", config, name)
    expect(step.name).toBe(name)
    const context = new SsgContextImpl("fr")
    const result = await step.execute(context)
    expect(result).toEqual({directoryCount: 1})
  })
})
