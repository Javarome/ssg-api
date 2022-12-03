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
      postExecuted = false

      protected async createReplacer(context: HtmlSsgContext): Promise<DomReplacer> {
        return domReplacer
      }

      protected async postExecute(context: HtmlSsgContext) {
        command.postExecuted = true
      }
    }("a")
    const context = testUtil.newHtmlContext("test.xml", `<a href="link">text</a>`)
    expect(command.postExecuted).toBe(false)
    const outFile = await command.execute(context)
    expect(command.postExecuted).toBe(true)
    expect(outFile.contents).toBe(`<html><head></head><body><a href="link" data-prop="value">text</a></body></html>`)
  })
})
