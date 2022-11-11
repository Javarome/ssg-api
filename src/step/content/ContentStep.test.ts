import {ContentStep} from "./ContentStep"
import {SsgContext} from "../../SsgContext"
import {HtmlSsgFile, SsgFile} from "../../util"
import {SsgContextImpl} from "../../SsgContextImpl"

describe("ContentStep", () => {

  test("parses HTML", async () => {
    const outputFunc = async (context: SsgContext, info: SsgFile) => {
      info.write()
    }
    const contentConfigs = [{
      roots: ["src/test/*.html"],
      replacements: [],
      getOutputFile(context: SsgContext) {
        return context.inputFile
      }
    }]
    const step = new ContentStep(contentConfigs, outputFunc)
    const context = new SsgContextImpl("fr", {})
    const result = await step.execute(context)
    expect(result).toEqual({contentCount: 1})
    const outputFile = context.outputFile as HtmlSsgFile
    expect(outputFile.meta.author).toEqual(["Jérôme Beau"])
    expect(outputFile.meta.url).toBe("https://rr0.org/tech/info/soft")
    expect(outputFile.meta.copyright).toBe("RR0")
    expect(outputFile.title).toBe("Some title")
  })
})
