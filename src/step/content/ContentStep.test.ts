import fs from "fs"
import path from "path"
import { describe, expect, test } from "@javarome/testscript"
import { ContentStep } from "./ContentStep.js"
import { SsgContext } from "../../SsgContext.js"
import { SsgContextImpl } from "../../SsgContextImpl.js"
import { ContentStepConfig } from "./ContentStepConfig.js"
import { HtmlFileContents } from "../../file/index.js"
import { FileContents } from "@javarome/fileutil"

describe("ContentStep", () => {

  const outDir = "out"

  test("parses HTML", async () => {
    fs.rmSync(outDir, {recursive: true, force: true})
    const outputFunc = async (context: SsgContext, info: FileContents) => {
      try {
        context.log("Writing", info.name)
        await info.write()
      } catch (e) {
        context.error(info.name, e)
      }
    }
    const contentConfigs: ContentStepConfig[] = [{
      roots: ["test/*.html"],
      replacements: [],
      getOutputPath(context: SsgContext) {
        return path.join(outDir, context.file.name)
      }
    }]
    const step = new class extends ContentStep {
      protected async shouldProcessFile(_context: SsgContext, _contentsConfig: ContentStepConfig): Promise<boolean> {
        return true  // Always process all files even if unmodified
      }
    }(contentConfigs, outputFunc)
    const context = new SsgContextImpl("fr")
    const result = await step.execute(context)
    expect(result.processedFiles.length).toEqual(4)
    const outputFile = context.file as HtmlFileContents
    expect(outputFile.meta.author).toEqual(["Jérôme Beau"])
    expect(outputFile.meta.url).toBe("https://rr0.org/tech/info/soft")
    expect(outputFile.meta.copyright).toBe("RR0")
    expect(outputFile.title).toBe("Some title")
  })
})
