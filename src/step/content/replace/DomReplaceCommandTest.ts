import { describe, expect, test } from "@javarome/testscript"
import { DomReplaceCommand } from "./DomReplaceCommand.js"
import { HtmlSsgContext } from "../../../HtmlSsgContext.js"
import { DomReplacer } from "./DomReplacer.js"
import { testUtil } from "../../../../test/TestUtil.js"
import { SsgContext } from "../../../SsgContext.js"
import { ReplacerFactory } from "./ReplacerFactory.js"

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

      protected async postExecute(context: HtmlSsgContext) {
        command.postExecuted = true
      }
    }("a", new class implements ReplacerFactory<DomReplacer> {
      async create(_context: SsgContext): Promise<DomReplacer> {
        return domReplacer
      }
    })
    const context = testUtil.newHtmlContext("test.xml", `<a href="link">text</a>`)
    expect(command.postExecuted).toBe(false)
    await command.execute(context)
    expect(command.postExecuted).toBe(true)
    const contents = context.file.contents as string
    expect(contents).toBe(
      `<html><head><meta name="generator" content="ssg-api"></head><body><a href="link" data-prop="value">text</a></body></html>`)
  })
})
