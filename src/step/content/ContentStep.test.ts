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
    expect(outputFile.meta.author).toEqual(["Paul Jaffe (président du NCAS, janvier 1999)"])
    expect(outputFile.meta.url).toBe("https://www.ncas.org/condon/text/intro.htm")
    expect(outputFile.meta.copyright).toBeUndefined()
    expect(outputFile.title).toBe("Introduction à l'édition du NCAS")
  })
})
