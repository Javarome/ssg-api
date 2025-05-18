import { describe, expect, test } from "@javarome/testscript"
import { testUtil } from "../../../../../../test/TestUtil.js"
import { ClassDomReplaceCommand } from "./ClassDomReplaceCommand.js"
import { ReplacerFactory } from "../../ReplacerFactory.js"
import { SsgContext } from "../../../../../SsgContext.js"
import { DomReplacer } from "../../DomReplacer.js"

describe("ClassDomRegexReplaceCommand", () => {

  test("replaces one class", async () => {
    const repFactory = new class implements ReplacerFactory<DomReplacer> {
      async create(_context: SsgContext): Promise<DomReplacer> {
        return {
          replace: async (original: HTMLElement): Promise<HTMLElement> => {
            original.className = "done"
            return original
          }
        }
      }
    }()
    const command = new ClassDomReplaceCommand(repFactory, "temoin")
    const context = testUtil.newHtmlContext("Test.html", `<span class="witness">Untel</span>`)
    await command.execute(context)
    const contents = context.file.contents as string
    expect(contents).toBe(
      `<html><head><meta name="generator" content="ssg-api"></head><body><span class="done">Untel</span></body></html>`)
  })

  test("replaces multiple classes", async () => {
    const repFactory = new class implements ReplacerFactory<DomReplacer> {
      async create(context: SsgContext): Promise<DomReplacer> {
        return {
          replace: async (original: HTMLElement): Promise<HTMLElement> => {
            original.className = "done"
            return original
          }
        }
      }
    }()
    const command = new ClassDomReplaceCommand(repFactory, "temoin1", "temoin2")
    const context = testUtil.newHtmlContext("Test.html",
      `<span class="temoin1">Untel 1</span>, <span class="temoin2">Untel 2</span>`)
    await command.execute(context)
    const contents = context.file.contents as string
    expect(contents).toBe(
      `<html><head><meta name="generator" content="ssg-api"></head><body><span class="done">Untel 1</span>, <span class="done">Untel 2</span></body></html>`)
  })
})
