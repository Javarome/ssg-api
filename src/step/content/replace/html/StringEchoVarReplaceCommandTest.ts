import { testUtil } from "../../../../../test/TestUtil"
import { StringEchoVarReplaceCommand } from "./StringEchoVarReplaceCommand"
import { describe, expect, test } from "@javarome/testscript"

describe("StringEchoVarReplaceCommand", () => {

  test("replaces var in string", async () => {
    const command = new StringEchoVarReplaceCommand("mail", [])
    const context = testUtil.newHtmlContext("Contact.html",
      `<a href="mailto:\$\{mail\}">Commentaires</a>`)
    context.setVar("mail", "javarome@gmail.com")
    expect(context.getVar("mail")).toBe("javarome@gmail.com")
    await command.execute(context)
    expect(context.file.contents).toBe(`<a href="mailto:javarome@gmail.com">Commentaires</a>`)
  })
})
