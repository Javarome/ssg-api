import { HtmlTagReplaceCommand } from "./HtmlTagReplaceCommand.js"
import { ReplacerFactory } from "../../ReplacerFactory.js"
import { SsgContext } from "../../../../../SsgContext.js"
import { testUtil } from "../../../../../../test/TestUtil.js"
import { DomReplacer } from "../../DomReplacer.js"
import { describe, expect, test } from "@javarome/testscript"

describe("HtmlTagReplaceCommand", () => {

  test("replaces tag", async () => {
    const command = new HtmlTagReplaceCommand("a", new class implements ReplacerFactory<DomReplacer> {
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
    await command.execute(context)
    expect(context.file.contents).toBe(
      `<html><head><meta name="generator" content="ssg-api"></head><body><a href="link" data-prop="value">text</a></body></html>`)
  })
})
