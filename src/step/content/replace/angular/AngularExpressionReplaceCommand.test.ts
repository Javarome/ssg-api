import { AngularExpressionReplaceCommand } from "./AngularExpressionReplaceCommand.js"
import { testUtil } from "../../../../../test/TestUtil.js"
import { describe, expect, test } from "@javarome/testscript"

describe("AngularExpressionReplaceCommand", () => {

  test("replace text", async () => {
    const context = testUtil.newHtmlContext("Contact.html",
      `my name is {{name}}`)
    context.setVar("name", "Jérôme")
    const command = new AngularExpressionReplaceCommand()
    await command.execute(context)
    const contents = context.file.contents as string
    expect(contents).toBe(`<html><head></head><body>my name is Jérôme</body></html>`)
  })

  test("replace numbers", async () => {
    const context = testUtil.newHtmlContext("Contact.html",
      `The price is {{price|number}}`)
    context.setVar("price", 39500)
    const command = new AngularExpressionReplaceCommand()
    await command.execute(context)
    const contents = context.file.contents as string
    expect(contents).toBe(`<html><head></head><body>The price is 39 500</body></html>`)
  })

  test("replace currency", async () => {
    const context = testUtil.newHtmlContext("Contact.html",
      `The price is {{100000000|currency:'$':0}}`)
    const command = new AngularExpressionReplaceCommand()
    await command.execute(context)
    const contents = context.file.contents as string
    expect(contents).toBe(`<html><head></head><body>The price is 100 000 000,00&nbsp;$US</body></html>`)
  })

  test("replace context value", async () => {
    const context = testUtil.newHtmlContext("Contact.html",
      `The context is {{$context._name}}`)
    context.name = "My context"
    context.setVar("price", 39500)
    const command = new AngularExpressionReplaceCommand()
    await command.execute(context)
    const contents = context.file.contents as string
    expect(contents).toBe(`<html><head></head><body>The context is My context</body></html>`)
  })
})
