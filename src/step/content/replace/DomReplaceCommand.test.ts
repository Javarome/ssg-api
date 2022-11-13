import {DomReplaceCommand} from "./DomReplaceCommand"
import {HtmlSsgContext} from "../../../HtmlSsgContext"
import {DomReplacer} from "./DomReplacer"
import {testUtil} from "../../../../test/TestUtil"

describe("DomReplaceCommand", () => {

  test("replaces", async () => {
    const domReplacer = new class implements DomReplacer {
      async replace(original: HTMLElement): Promise<HTMLElement> {
        original.dataset.prop = "value"
        return original
      }
    }
    const command = new class extends DomReplaceCommand {
      protected async createReplacer(context: HtmlSsgContext): Promise<DomReplacer> {
        return domReplacer
      }
    }("a")
    const context = testUtil.newHtmlContext("test.xml", `<a href="link">text</a>`)
    const outFile = await command.execute(context)
    expect(outFile.contents).toBe(`<html><head></head><body><a href="link" data-prop="value">text</a></body></html>`)
  })
})
