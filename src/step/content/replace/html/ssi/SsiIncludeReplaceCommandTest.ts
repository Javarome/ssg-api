import { testUtil } from "../../../../../../test/TestUtil.js"
import { describe, expect, test } from "@javarome/testscript"
import { SsiIncludeReplaceCommand, SsiIncludeReplaceCommandTransformer } from "./SsiIncludeReplaceCommand"
import { FileContents } from "../../../../../file"
import { SsgContext } from "../../../../../SsgContext"

describe("SsiIncludeReplaceCommand", () => {

  test("replace include", async () => {
    const includedContent = "included content"
    const command = new class extends SsiIncludeReplaceCommand {
      protected fetchFile(fileName: string): FileContents {
        return new FileContents(fileName, "utf-8", includedContent, new Date(), {lang: "en", variants: []})
      }
    }()
    const before = "<p>Start of included HTML:</p>"
    const after = "<p>End of included HTML.</p>"
    const context = testUtil.newHtmlContext("index.html",
      `${before}<!--#include virtual="include.html" -->${after}`)
    await command.execute(context)
    expect(context.file.contents).toBe(`${before}${includedContent}${after}`)
  })

  test("replace transformed include", async () => {
    const csvTransformer: SsiIncludeReplaceCommandTransformer = {
      transform(context: SsgContext, includeFile: FileContents) {
        return includeFile.name.endsWith(".csv") ? "<table>" + includeFile.contents + "</table>" : undefined
      }
    }
    const quoteTransformer: SsiIncludeReplaceCommandTransformer = {
      transform(context: SsgContext, includeFile: FileContents) {
        return includeFile.name.endsWith(".html") ? "<blockquote>" + includeFile.contents + "</blockquote>" : undefined
      }
    }
    const includedContent = "included content"
    const command = new class extends SsiIncludeReplaceCommand {
      protected fetchFile(fileName: string): FileContents {
        return new FileContents(fileName, "utf-8", includedContent, new Date(), {lang: "en", variants: []})
      }
    }([csvTransformer, quoteTransformer])
    const before = "<p>Start of included HTML:</p>"
    const after = "<p>End of included HTML.</p>"
    const context = testUtil.newHtmlContext("index.html",
      `${before}<!--#include virtual="include.html" -->${after}`)
    await command.execute(context)
    expect(context.file.contents).toBe(`${before}<blockquote>${includedContent}</blockquote>${after}`)
  })
})
