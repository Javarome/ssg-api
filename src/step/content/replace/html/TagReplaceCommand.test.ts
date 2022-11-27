import {TagDomReplaceCommand} from "./TagReplaceCommand"
import {ReplacerFactory} from "../ReplacerFactory"
import {SsgContext} from "../../../../SsgContext"
import {testUtil} from "../../../../../test/TestUtil"
import {DomReplacer} from "../DomReplacer"

describe("TagReplaceCommand", () => {

  test("replaces tag", async () => {
    const command = new TagDomReplaceCommand("a", new class implements ReplacerFactory<DomReplacer> {
      async create(context: SsgContext): Promise<DomReplacer> {
        return new class implements DomReplacer {
          async replace(original: HTMLElement): Promise<HTMLElement> {
            original.dataset.prop = "value"
            return original
          }
        }
      }
    })
    const context = testUtil.newHtmlContext("test.xml", `<a href="link">text</a>`)
    const outFile = await command.execute(context)
    expect(outFile.contents).toBe(`<html><head></head><body><a href="link" data-prop="value">text</a></body></html>`)
  })
})
