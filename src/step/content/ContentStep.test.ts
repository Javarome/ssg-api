import fs from "fs"
import path from "path"
import { describe, expect, test } from "@javarome/testscript"
import { ContentStep } from "./ContentStep.js"
import { SsgContext } from "../../SsgContext.js"
import { SsgContextImpl } from "../../SsgContextImpl.js"
import { ContentStepConfig } from "./ContentStepConfig.js"
import { HtmlFileContents } from "../../file/index.js"
import { FileContents } from "@javarome/fileutil"
import { SsiIncludeReplaceCommand } from "./replace"

describe("ContentStep", () => {

  const outDir = "out"

  test("parses HTML", async () => {
    fs.rmSync(outDir, {recursive: true, force: true})
    const outputFunc = async (context: SsgContext, fileContents: FileContents) => {
      try {
        context.log("Writing", fileContents.name)
        await fileContents.write()
      } catch (e) {
        context.error(fileContents.name, e)
      }
    }
    const contentConfigs: ContentStepConfig[] = [{
      roots: ["test/test*.html"],
      replacements: [
        new SsiIncludeReplaceCommand()
      ],
      getOutputPath(context: SsgContext) {
        return path.join(outDir, context.file.name)
      }
    }]
    const step = new class extends ContentStep {
      protected async shouldProcessFile(_context: SsgContext, _contentsConfig: ContentStepConfig): Promise<boolean> {
        return true  // Always process all files even if unmodified
      }

      protected async processFileContents(context: SsgContext, filePath: string,
                                          contentsConfig: ContentStepConfig): Promise<string> {
        const outputFileName = super.processFileContents(context, filePath, contentsConfig)
        expect(context.outputFile).toBeDefined()
        return outputFileName
      }
    }(contentConfigs, outputFunc)
    const context = new SsgContextImpl("fr")
    const result = await step.execute(context)
    expect(result.processedFiles.length).toEqual(6)
    const outputFile = context.file as HtmlFileContents
    expect(outputFile.meta.author).toEqual(["Jérôme Beau"])
    expect(outputFile.meta.url).toBe("https://rr0.org/tech/info/soft")
    expect(outputFile.meta.copyright).toBe("RR0")
    expect(outputFile.title).toBe("Some title")
  })
})
